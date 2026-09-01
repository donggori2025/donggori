"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  activities as seedActivities,
  comments as seedComments,
  emptySpecs,
  libraryAssets as seedAssets,
  products as seedProducts,
  collaboratorsOf,
  firstSyllable,
  userFromToken,
  users as seedUsers,
  versions as seedVersions,
  workspaces as seedWorkspaces,
  teams as seedTeams,
  trashedItems as seedTrash,
  CURRENT_USER_ID,
  DISPLAY_ACCOUNT,
  PERSONAL_WORKSPACE_ID,
} from "./data";
import { DEFAULT_AVATAR, type VoxelAvatarConfig } from "./dicebear-avatar";
import { printShareFiles } from "./product-files";
import type {
  Activity,
  CanvasNode,
  CanvasNodeType,
  Comment,
  LibraryAsset,
  LinkAccess,
  Mode,
  Product,
  ProductAccessRole,
  ProductCategory,
  ProductCollaborator,
  ProductFile,
  ProductStatus,
  TeamAccess,
  TaskStatus,
  Team,
  TrashedItem,
  User,
  Version,
  VersionSnapshot,
  Workspace,
  WorkspaceSticker,
} from "./types";

interface WorkspaceState {
  products: Product[];
  comments: Comment[];
  versions: Version[];
  activities: Activity[];
  workspaces: Workspace[];
  teams: Team[];
  assets: LibraryAsset[];
  trash: TrashedItem[];
  users: User[];
  currentWorkspaceId: string;
  currentTeamId: string | null;
  currentUserId: string;
  displayAccount: { name: string; email: string; avatar: VoxelAvatarConfig };
  marketingConsent: boolean;
}

interface WorkspaceApi extends WorkspaceState {
  currentWorkspace: Workspace;
  currentTeam: Team | null;
  contextWorkspaces: Workspace[];
  workspaceProducts: Product[];
  workspaceAssets: LibraryAsset[];
  getProduct: (id: string) => Product | undefined;
  getProductByShareToken: (token: string) => Product | undefined;
  getUser: (id: string) => User | undefined;
  ensureShareToken: (productId: string) => string;
  updateProductSchedule: (
    productId: string,
    patch: {
      status?: ProductStatus;
      dueDate?: string;
      sampleDue?: string;
      productionDue?: string;
      factory?: string;
    },
  ) => void;
  setWorkspace: (id: string) => void;
  setTeamContext: (teamId: string | null) => void;
  createTeam: (name: string, locked: boolean, ownerId: string) => string;
  createWorkspace: (name: string) => string;
  createFolder: (name: string) => void;
  updateWorkspace: (
    id: string,
    patch: {
      name?: string;
      color?: string;
      coverImage?: string | null;
      coverImageX?: number;
      coverImageY?: number;
      stickers?: WorkspaceSticker[];
    },
  ) => void;
  addWorkspaceStickers: (workspaceId: string, stickers: WorkspaceSticker[]) => void;
  patchWorkspaceSticker: (
    workspaceId: string,
    stickerId: string,
    patch: Partial<Pick<WorkspaceSticker, "x" | "y" | "w" | "rotate">>,
  ) => void;
  removeWorkspaceSticker: (workspaceId: string, stickerId: string) => void;
  deleteWorkspace: (id: string) => void;
  inviteMember: (userId: string) => void;
  inviteToProduct: (productId: string, tokens: string[], role: ProductAccessRole) => void;
  inviteToWorkspace: (tokens: string[], role: ProductAccessRole) => void;
  setCollaboratorAccess: (productId: string, userId: string, access: ProductAccessRole) => void;
  removeCollaborator: (productId: string, userId: string) => void;
  setAnyoneAccess: (productId: string, access: LinkAccess) => void;
  setWorkspaceAccess: (productId: string, access: TeamAccess) => void;
  createProduct: (name: string, options?: { category?: ProductCategory; description?: string }) => string;
  createAsset: (input: {
    group: "design" | "production";
    kind: string;
    name: string;
    meta: string;
    data?: unknown;
    workspaceId?: string;
  }) => void;
  updateAsset: (id: string, patch: Partial<Pick<LibraryAsset, "name" | "meta" | "kind" | "data">>) => void;
  deleteAsset: (id: string) => void;
  duplicateProduct: (id: string) => void;
  deleteProduct: (id: string) => void;
  renameVersion: (versionId: string, title: string) => void;
  restoreVersion: (productId: string, versionId: string) => void;
  duplicateVersion: (productId: string, versionId: string) => void;
  duplicateAsset: (id: string) => void;
  toggleItemFavorite: (kind: "product" | "asset", id: string) => void;
  moveItemToFolder: (kind: "product" | "asset", id: string, folderId: string) => void;
  restoreTrashItem: (id: string) => void;
  deleteTrashItem: (id: string) => void;
  updateStatus: (productId: string, status: ProductStatus) => void;
  updateSpecsField: (productId: string, updater: (p: Product) => Product) => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt" | "authorId"> & { authorId?: string }) => void;
  convertToTask: (commentId: string, assigneeId: string) => void;
  setTaskStatus: (commentId: string, status: TaskStatus) => void;
  addNode: (
    productId: string,
    type: CanvasNodeType,
    options?: { linkedTo?: string; boardKind?: "general" | "specs"; title?: string },
  ) => void;
  moveNode: (productId: string, nodeId: string, x: number, y: number) => void;
  updateNode: (productId: string, nodeId: string, patch: Partial<CanvasNode>) => void;
  deleteNode: (productId: string, nodeId: string) => void;
  hideNodePart: (productId: string, nodeId: string, partId: string) => void;
  updateMaterialWeight: (productId: string, weight: string) => void;
  updateDisplayAccount: (name: string) => void;
  updateAvatar: (avatar: VoxelAvatarConfig) => void;
  setMarketingConsent: (value: boolean) => void;
}

const Ctx = createContext<WorkspaceApi | null>(null);

function cloneSnapshot(snapshot: VersionSnapshot): VersionSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as VersionSnapshot;
}

function snapshotFromProduct(product: Product): VersionSnapshot {
  return cloneSnapshot({ nodes: product.nodes, specs: product.specs });
}

function snapshotOfVersion(version: Version, product: Product): VersionSnapshot {
  return version.snapshot ? cloneSnapshot(version.snapshot) : snapshotFromProduct(product);
}

let seq = 100;

const PRODUCT_FILES_KEY = "faddit-product-files";
const WORKSPACE_BACKDROP_KEY = "faddit-workspace-backdrops";

function loadStoredProductFiles(): Record<string, ProductFile[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PRODUCT_FILES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProductFile[]>) : {};
  } catch {
    return {};
  }
}

function mergeStoredProductFiles(seed: ProductFile[] | undefined, stored: ProductFile[]): ProductFile[] {
  const seedPrints = printShareFiles(seed);
  if (!seedPrints.length || printShareFiles(stored).length) return stored;
  const ids = new Set(stored.map((file) => file.id));
  return [...stored, ...seedPrints.filter((file) => !ids.has(file.id))];
}

function saveStoredProductFiles(products: Product[]) {
  if (typeof window === "undefined") return;
  const map = loadStoredProductFiles();
  for (const p of products) {
    if (!p.files) continue;
    if (p.files.length) map[p.id] = p.files;
    else delete map[p.id];
  }
  try {
    localStorage.setItem(PRODUCT_FILES_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

type StoredWorkspaceBackdrop = {
  color: string;
  stickers: WorkspaceSticker[];
  coverImage: string | null;
  coverImageX?: number;
  coverImageY?: number;
};

type StoredWorkspaceBackdrops = {
  byId: Record<string, StoredWorkspaceBackdrop>;
  extras: Workspace[];
};

const SEED_WORKSPACE_IDS = new Set(seedWorkspaces.map((w) => w.id));

function loadStoredBackdrops(): StoredWorkspaceBackdrops {
  if (typeof window === "undefined") return { byId: {}, extras: [] };
  try {
    const raw = localStorage.getItem(WORKSPACE_BACKDROP_KEY);
    if (!raw) return { byId: {}, extras: [] };
    const parsed = JSON.parse(raw) as StoredWorkspaceBackdrops;
    return {
      byId: parsed.byId && typeof parsed.byId === "object" ? parsed.byId : {},
      extras: Array.isArray(parsed.extras) ? parsed.extras : [],
    };
  } catch {
    return { byId: {}, extras: [] };
  }
}

function persistWorkspaceBackdrops(workspaces: Workspace[]) {
  if (typeof window === "undefined") return;
  const byId: Record<string, StoredWorkspaceBackdrop> = {};
  const extras: Workspace[] = [];
  for (const w of workspaces) {
    byId[w.id] = {
      color: w.color,
      stickers: w.stickers ?? [],
      coverImage: w.coverImage ?? null,
      coverImageX: w.coverImageX,
      coverImageY: w.coverImageY,
    };
    if (!SEED_WORKSPACE_IDS.has(w.id)) {
      extras.push({
        ...w,
        stickers: undefined,
        coverImage: undefined,
        coverImageX: undefined,
        coverImageY: undefined,
      });
    }
  }
  try {
    localStorage.setItem(WORKSPACE_BACKDROP_KEY, JSON.stringify({ byId, extras }));
  } catch {
    /* quota */
  }
}

function applyStoredBackdrops(workspaces: Workspace[], stored: StoredWorkspaceBackdrops): Workspace[] {
  const known = new Set(workspaces.map((w) => w.id));
  const extras = stored.extras.filter((w) => w?.id && !known.has(w.id));
  return [...workspaces, ...extras].map((w) => {
    const saved = stored.byId[w.id];
    if (!saved) return w;
    return {
      ...w,
      color: saved.color || w.color,
      stickers: Array.isArray(saved.stickers) ? saved.stickers : w.stickers,
      coverImage: saved.coverImage ?? undefined,
      coverImageX: saved.coverImageX,
      coverImageY: saved.coverImageY,
    };
  });
}

function stickersOfWorkspace(w: Workspace): WorkspaceSticker[] {
  if (w.stickers?.length) return w.stickers;
  if (!w.coverImage) return [];
  return [
    {
      id: `sticker-legacy-${w.id}`,
      src: w.coverImage,
      x: w.coverImageX ?? 52,
      y: w.coverImageY ?? 14,
      w: 152,
      rotate: -2.5,
    },
  ];
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>({
    products: seedProducts,
    comments: seedComments,
    versions: seedVersions,
    activities: seedActivities,
    workspaces: seedWorkspaces,
    teams: seedTeams,
    assets: seedAssets,
    trash: seedTrash,
    users: seedUsers,
    currentWorkspaceId: PERSONAL_WORKSPACE_ID,
    currentTeamId: null,
    currentUserId: CURRENT_USER_ID,
    displayAccount: { ...DISPLAY_ACCOUNT, avatar: DEFAULT_AVATAR },
    marketingConsent: false,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      localStorage.removeItem("faddit-schedule-board");
      localStorage.removeItem("faddit-workspace-schedule");
    } catch {
      /* ignore */
    }
    const storedFiles = loadStoredProductFiles();
    const storedBackdrops = loadStoredBackdrops();
    const hasFiles = Object.keys(storedFiles).length > 0;
    const hasBackdrops = Object.keys(storedBackdrops.byId).length > 0 || storedBackdrops.extras.length > 0;
    if (!hasFiles && !hasBackdrops) return;
    setState((s) => {
      const workspaces = hasBackdrops ? applyStoredBackdrops(s.workspaces, storedBackdrops) : s.workspaces;
      const products = hasFiles
        ? s.products.map((p) =>
            storedFiles[p.id] ? { ...p, files: mergeStoredProductFiles(p.files, storedFiles[p.id]) } : p,
          )
        : s.products;
      return { ...s, products, workspaces };
    });
  }, []);

  const currentWorkspace = useMemo(
    () => state.workspaces.find((w) => w.id === state.currentWorkspaceId) ?? state.workspaces[0],
    [state.workspaces, state.currentWorkspaceId],
  );

  const currentTeam = useMemo(
    () => (state.currentTeamId ? state.teams.find((t) => t.id === state.currentTeamId) ?? null : null),
    [state.teams, state.currentTeamId],
  );

  const contextWorkspaces = useMemo(
    () => state.workspaces.filter((w) => (state.currentTeamId ? w.teamId === state.currentTeamId : w.teamId === null)),
    [state.workspaces, state.currentTeamId],
  );

  const workspaceProducts = useMemo(
    () => state.products.filter((p) => p.workspaceId === state.currentWorkspaceId),
    [state.products, state.currentWorkspaceId],
  );

  const workspaceAssets = useMemo(
    () => state.assets.filter((a) => a.workspaceId === state.currentWorkspaceId),
    [state.assets, state.currentWorkspaceId],
  );

  const getProduct = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );

  const getProductByShareToken = useCallback(
    (token: string) => state.products.find((p) => p.shareToken === token || p.id === token),
    [state.products],
  );

  const ensureShareToken = useCallback((productId: string) => {
    const existing = stateRef.current.products.find((p) => p.id === productId)?.shareToken;
    if (existing) return existing;
    const token = `fac-${productId}-${Math.random().toString(36).slice(2, 8)}`;
    setState((s) => {
      const product = s.products.find((p) => p.id === productId);
      if (!product) return s;
      if (product.shareToken) return s;
      return {
        ...s,
        products: s.products.map((p) => (p.id === productId ? { ...p, shareToken: token } : p)),
      };
    });
    return token;
  }, []);

  const getUser = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users],
  );

  const setWorkspace = useCallback((id: string) => {
    setState((s) => {
      const ws = s.workspaces.find((w) => w.id === id);
      return {
        ...s,
        currentWorkspaceId: id,
        currentTeamId: ws?.teamId ?? null,
      };
    });
  }, []);

  const setTeamContext = useCallback((teamId: string | null) => {
    setState((s) => ({ ...s, currentTeamId: teamId }));
  }, []);

  const createTeam = useCallback((name: string, locked: boolean, ownerId: string) => {
    const id = `team-${++seq}`;
    const team: Team = {
      id,
      name,
      initial: name.slice(0, 1).toUpperCase(),
      color: locked ? "#f3e0c8" : "#d7e6f5",
      memberIds: [ownerId],
      locked,
    };
    setState((s) => ({ ...s, teams: [...s.teams, team], currentTeamId: id }));
    return id;
  }, []);

  const createWorkspace = useCallback((name: string) => {
    const id = `ws-${++seq}`;
    setState((s) => {
      const team = s.currentTeamId ? s.teams.find((t) => t.id === s.currentTeamId) : null;
      const ws: Workspace = {
        id,
        teamId: s.currentTeamId,
        kind: s.currentTeamId ? "team" : "personal",
        name,
        initial: name.slice(0, 1).toUpperCase(),
        color: team?.color ?? "#e7e4dd",
        memberIds: team?.memberIds ?? [s.currentUserId],
        sizeLabel: "0MB",
      };
      return { ...s, workspaces: [...s.workspaces, ws], currentWorkspaceId: id };
    });
    return id;
  }, []);

  const createFolder = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      workspaces: s.workspaces.map((w) =>
        w.id === s.currentWorkspaceId
          ? {
              ...w,
              folders: [{ id: `folder-${++seq}`, name: trimmed }, ...(w.folders ?? [])],
            }
          : w,
      ),
    }));
  }, []);

  const updateWorkspace = useCallback(
    (
      id: string,
      patch: {
        name?: string;
        color?: string;
        coverImage?: string | null;
        coverImageX?: number;
        coverImageY?: number;
        stickers?: WorkspaceSticker[];
      },
    ) => {
    setState((s) => {
      const workspaces = s.workspaces.map((w) => {
        if (w.id !== id) return w;
        const next: Workspace = { ...w };
        if (patch.name !== undefined) {
          const name = patch.name.trim();
          if (name) {
            next.name = name;
            next.initial = firstSyllable(name);
          }
        }
        if (patch.color !== undefined) next.color = patch.color;
        if (patch.coverImage !== undefined) {
          next.coverImage = patch.coverImage ?? undefined;
          if (!patch.coverImage) {
            next.coverImageX = undefined;
            next.coverImageY = undefined;
          } else if (next.coverImageX == null || next.coverImageY == null) {
            next.coverImageX = 58;
            next.coverImageY = 16;
          }
        }
        if (patch.coverImageX !== undefined) next.coverImageX = patch.coverImageX;
        if (patch.coverImageY !== undefined) next.coverImageY = patch.coverImageY;
        if (patch.stickers !== undefined) {
          next.stickers = patch.stickers;
          next.coverImage = patch.stickers[0]?.src ?? undefined;
          if (!patch.stickers.length) {
            next.coverImageX = undefined;
            next.coverImageY = undefined;
          }
        }
        return next;
      });
      if (
        patch.color !== undefined ||
        patch.coverImage !== undefined ||
        patch.coverImageX !== undefined ||
        patch.coverImageY !== undefined ||
        patch.stickers !== undefined
      ) {
        persistWorkspaceBackdrops(workspaces);
      }
      return { ...s, workspaces };
    });
  },
  []);

  const addWorkspaceStickers = useCallback((workspaceId: string, stickers: WorkspaceSticker[]) => {
    if (!stickers.length) return;
    setState((s) => {
      const workspaces = s.workspaces.map((w) => {
        if (w.id !== workspaceId) return w;
        const nextStickers = [...stickersOfWorkspace(w), ...stickers];
        return {
          ...w,
          stickers: nextStickers,
          coverImage: nextStickers[0]?.src ?? w.coverImage,
        };
      });
      persistWorkspaceBackdrops(workspaces);
      return { ...s, workspaces };
    });
  }, []);

  const patchWorkspaceSticker = useCallback(
    (workspaceId: string, stickerId: string, patch: Partial<Pick<WorkspaceSticker, "x" | "y" | "w" | "rotate">>) => {
      setState((s) => {
        const workspaces = s.workspaces.map((w) => {
          if (w.id !== workspaceId) return w;
          return {
            ...w,
            stickers: stickersOfWorkspace(w).map((st) => (st.id === stickerId ? { ...st, ...patch } : st)),
          };
        });
        persistWorkspaceBackdrops(workspaces);
        return { ...s, workspaces };
      });
    },
    [],
  );

  const removeWorkspaceSticker = useCallback((workspaceId: string, stickerId: string) => {
    setState((s) => {
      const workspaces = s.workspaces.map((w) => {
        if (w.id !== workspaceId) return w;
        const stickers = stickersOfWorkspace(w).filter((st) => st.id !== stickerId);
        return {
          ...w,
          stickers,
          coverImage: stickers[0]?.src ?? undefined,
          coverImageX: stickers.length ? w.coverImageX : undefined,
          coverImageY: stickers.length ? w.coverImageY : undefined,
        };
      });
      persistWorkspaceBackdrops(workspaces);
      return { ...s, workspaces };
    });
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    setState((s) => {
      const deleted = s.workspaces.find((w) => w.id === id);
      if (!deleted || s.workspaces.length <= 1) return s;
      const remaining = s.workspaces.filter((w) => w.id !== id);
      const fallback =
        remaining.find((w) => w.teamId === deleted.teamId) ??
        remaining.find((w) => w.id === PERSONAL_WORKSPACE_ID) ??
        remaining[0];
      persistWorkspaceBackdrops(remaining);
      return {
        ...s,
        workspaces: remaining,
        currentWorkspaceId: s.currentWorkspaceId === id ? fallback.id : s.currentWorkspaceId,
        activities: [
          {
            id: `a-${++seq}`,
            actorId: s.currentUserId,
            text: `${deleted.name} 워크스페이스를 삭제했습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const inviteMember = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      teams: s.currentTeamId
        ? s.teams.map((t) =>
            t.id === s.currentTeamId && !t.memberIds.includes(userId) ? { ...t, memberIds: [...t.memberIds, userId] } : t,
          )
        : s.teams,
      workspaces: s.workspaces.map((w) => {
        const inContext = s.currentTeamId ? w.teamId === s.currentTeamId : w.id === s.currentWorkspaceId;
        if (!inContext || w.memberIds.includes(userId)) return w;
        return { ...w, memberIds: [...w.memberIds, userId] };
      }),
    }));
  }, []);

  const findUserByToken = (list: User[], token: string) => {
    const t = token.trim();
    const lower = t.toLowerCase();
    return list.find(
      (u) =>
        u.id === t ||
        u.name === t ||
        u.name.toLowerCase() === lower ||
        u.email?.toLowerCase() === lower ||
        u.email?.split("@")[0].toLowerCase() === lower,
    );
  };

  const extraIds = (p: Product, collaborators: ProductCollaborator[]) =>
    collaborators
      .map((c) => c.userId)
      .filter((id) => id !== p.ownerId && id !== p.designerId && id !== p.productionManagerId);

  const inviteToProduct = useCallback((productId: string, tokens: string[], role: ProductAccessRole) => {
    setState((s) => {
      const product = s.products.find((p) => p.id === productId);
      if (!product) return s;
      const access: ProductAccessRole = role === "owner" ? "edit" : role;
      let users = s.users;
      let collaborators = [...collaboratorsOf(product)];
      let designerId = product.designerId;
      const invitedNames: string[] = [];

      for (const raw of tokens) {
        const token = raw.trim();
        if (!token) continue;
        let user = findUserByToken(users, token);
        if (!user) {
          const created = userFromToken(token);
          user = created;
          if (!users.some((u) => u.id === created.id)) users = [...users, created];
        }
        const existing = collaborators.find((c) => c.userId === user.id);
        if (existing?.access === "owner") continue;
        if (existing) {
          collaborators = collaborators.map((c) => (c.userId === user.id ? { ...c, access } : c));
        } else {
          collaborators = [...collaborators, { userId: user.id, access }];
        }
        invitedNames.push(user.name);
      }

      if (invitedNames.length === 0) return users === s.users ? s : { ...s, users };

      if (access === "assignee") {
        const last = collaborators.filter((c) => c.access === "assignee" && c.userId !== product.ownerId).at(-1);
        if (last) {
          collaborators = collaborators.map((c) =>
            c.userId === last.userId ? c : c.access === "assignee" ? { ...c, access: "edit" } : c,
          );
          designerId = last.userId;
        }
      }

      const next: Product = {
        ...product,
        designerId,
        collaborators,
        collaboratorIds: extraIds({ ...product, designerId }, collaborators),
        updatedAt: "방금",
      };
      return {
        ...s,
        users,
        products: s.products.map((p) => (p.id === productId ? next : p)),
        activities: [
          {
            id: `a-${++seq}`,
            productId,
            actorId: s.currentUserId,
            text: `${invitedNames.join(", ")}님을 초대했습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const inviteToWorkspace = useCallback((tokens: string[], _role: ProductAccessRole) => {
    setState((s) => {
      const ws = s.workspaces.find((w) => w.id === s.currentWorkspaceId);
      if (!ws) return s;
      let users = s.users;
      let memberIds = [...ws.memberIds];
      const invitedNames: string[] = [];

      for (const raw of tokens) {
        const token = raw.trim();
        if (!token) continue;
        let user = findUserByToken(users, token);
        if (!user) {
          const created = userFromToken(token);
          user = created;
          if (!users.some((u) => u.id === created.id)) users = [...users, created];
        }
        if (!memberIds.includes(user.id)) memberIds = [...memberIds, user.id];
        invitedNames.push(user.name);
      }

      if (invitedNames.length === 0) return users === s.users ? s : { ...s, users };

      return {
        ...s,
        users,
        workspaces: s.workspaces.map((w) => (w.id === ws.id ? { ...w, memberIds } : w)),
        activities: [
          {
            id: `a-${++seq}`,
            actorId: s.currentUserId,
            text: `${invitedNames.join(", ")}님을 ${ws.name}에 초대했습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const setCollaboratorAccess = useCallback((productId: string, userId: string, access: ProductAccessRole) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id !== productId) return p;
        const current = collaboratorsOf(p);
        if (!current.some((c) => c.userId === userId)) return p;
        if (p.ownerId === userId && access !== "owner") return p;

        let collaborators = current.map((c) => (c.userId === userId ? { ...c, access } : c));
        let ownerId = p.ownerId;
        let designerId = p.designerId;

        if (access === "owner") {
          ownerId = userId;
          collaborators = collaborators.map((c) =>
            c.userId === userId ? { ...c, access: "owner" } : c.access === "owner" ? { ...c, access: "edit" } : c,
          );
        }
        if (access === "assignee") {
          collaborators = collaborators.map((c) =>
            c.userId === userId ? c : c.access === "assignee" ? { ...c, access: "edit" } : c,
          );
          designerId = userId;
        }
        return {
          ...p,
          ownerId,
          designerId,
          collaborators,
          collaboratorIds: extraIds({ ...p, ownerId, designerId }, collaborators),
          updatedAt: "방금",
        };
      }),
    }));
  }, []);

  const removeCollaborator = useCallback((productId: string, userId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id !== productId || p.ownerId === userId) return p;
        const collaborators = collaboratorsOf(p).filter((c) => c.userId !== userId);
        const designerId = p.designerId === userId ? p.ownerId : p.designerId;
        return {
          ...p,
          designerId,
          collaborators,
          collaboratorIds: extraIds({ ...p, designerId }, collaborators),
          updatedAt: "방금",
        };
      }),
    }));
  }, []);

  const setAnyoneAccess = useCallback((productId: string, access: LinkAccess) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === productId ? { ...p, anyoneAccess: access } : p)),
    }));
  }, []);

  const setWorkspaceAccess = useCallback((productId: string, access: TeamAccess) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === productId ? { ...p, workspaceAccess: access } : p)),
    }));
  }, []);

  const createProduct = useCallback((name: string, options?: { category?: ProductCategory; description?: string }) => {
    const id = `p-${++seq}`;
    setState((s) => {
      const product: Product = {
        id,
        name,
        code: `WS-${String(seq).slice(-3)}`,
        workspaceId: s.currentWorkspaceId,
        collectionId: "26ss",
        category: options?.category ?? "hoodie",
        status: "planning",
        ownerId: s.currentUserId,
        designerId: s.currentUserId,
        productionManagerId: s.currentUserId,
        collaboratorIds: [],
        collaborators: [{ userId: s.currentUserId, access: "owner" }],
        anyoneAccess: "view",
        workspaceAccess: "access",
        dueDate: "2026-09-15",
        version: 1,
        updatedAt: "방금",
        productionReady: 0,
        completed: [],
        missing: ["Design", "Main Fabric", "Size Spec"],
        specs: emptySpecs(options?.description ?? ""),
        nodes: [{ id: `n-${seq}`, type: "flat", title: `${name} Flat`, x: 80, y: 40 }],
      };
      return {
        ...s,
        products: [product, ...s.products],
        activities: [
          {
            id: `a-${++seq}`,
            productId: id,
            actorId: s.currentUserId,
            text: `${name} 제품을 만들었습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
    return id;
  }, []);

  const createAsset = useCallback(
    (input: {
      group: "design" | "production";
      kind: string;
      name: string;
      meta: string;
      data?: unknown;
      workspaceId?: string;
    }) => {
      const { workspaceId, ...rest } = input;
      setState((s) => ({
        ...s,
        assets: [
          {
            id: `asset-${++seq}`,
            workspaceId: workspaceId ?? s.currentWorkspaceId,
            uploaded: true,
            usedAt: "방금",
            ...rest,
          },
          ...s.assets,
        ],
      }));
    },
    [],
  );

  const updateAsset = useCallback((id: string, patch: Partial<Pick<LibraryAsset, "name" | "meta" | "kind" | "data">>) => {
    setState((s) => ({
      ...s,
      assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch, usedAt: "방금" } : a)),
    }));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setState((s) => {
      const item = s.assets.find((a) => a.id === id);
      if (!item) return s;
      return {
        ...s,
        assets: s.assets.filter((a) => a.id !== id),
        trash: [
          {
            id: `t-${++seq}`,
            workspaceId: item.workspaceId,
            name: item.name,
            kind: item.kind,
            deletedAt: "방금",
          },
          ...s.trash,
        ],
      };
    });
  }, []);

  const duplicateAsset = useCallback((id: string) => {
    setState((s) => {
      const item = s.assets.find((a) => a.id === id);
      if (!item) return s;
      return {
        ...s,
        assets: [
          {
            ...item,
            id: `asset-${++seq}`,
            name: `${item.name} 복사본`,
            usedAt: "방금",
          },
          ...s.assets,
        ],
      };
    });
  }, []);

  const duplicateProduct = useCallback((id: string) => {
    setState((s) => {
      const item = s.products.find((p) => p.id === id);
      if (!item) return s;
      const newId = `p-${++seq}`;
      const copy: Product = {
        ...item,
        id: newId,
        name: `${item.name} 복사본`,
        code: `WS-${String(seq).slice(-3)}`,
        updatedAt: "방금",
        nodes: item.nodes.map((n) => ({ ...n, id: `${n.id}-${seq}` })),
        files: item.files?.map((f) => ({ ...f, id: `file-${++seq}` })),
      };
      return { ...s, products: [copy, ...s.products] };
    });
  }, []);

  const renameVersion = useCallback((versionId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      versions: s.versions.map((v) => (v.id === versionId ? { ...v, title: trimmed } : v)),
    }));
  }, []);

  const restoreVersion = useCallback((productId: string, versionId: string) => {
    setState((s) => {
      const product = s.products.find((p) => p.id === productId);
      const version = s.versions.find((v) => v.id === versionId);
      if (!product || !version) return s;
      const snap = snapshotOfVersion(version, product);
      const maxN = Math.max(
        product.version,
        ...s.versions.filter((v) => v.productId === productId).map((v) => v.number),
      );
      const nextN = maxN + 1;
      return {
        ...s,
        products: s.products.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                nodes: snap.nodes,
                specs: snap.specs,
                version: nextN,
                updatedAt: "방금",
              },
        ),
        versions: [
          ...s.versions,
          {
            id: `v-${++seq}`,
            productId,
            number: nextN,
            title: `${version.title}에서 복원`,
            authorId: s.currentUserId,
            createdAt: "방금",
            changes: [{ field: "Version", from: `V${product.version}`, to: `V${version.number} 복원` }],
            snapshot: cloneSnapshot(snap),
          },
        ],
        activities: [
          {
            id: `a-${++seq}`,
            productId,
            actorId: s.currentUserId,
            text: `V${version.number} · ${version.title}(으)로 복원했습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const duplicateVersion = useCallback((productId: string, versionId: string) => {
    setState((s) => {
      const product = s.products.find((p) => p.id === productId);
      const version = s.versions.find((v) => v.id === versionId);
      if (!product || !version) return s;
      const snap = snapshotOfVersion(version, product);
      const newId = `p-${++seq}`;
      const copy: Product = {
        ...product,
        id: newId,
        name: `${product.name} · V${version.number} 복사본`,
        code: `WS-${String(seq).slice(-3)}`,
        version: 1,
        updatedAt: "방금",
        nodes: snap.nodes.map((n) => ({ ...n, id: `${n.id}-${seq}` })),
        specs: snap.specs,
        files: product.files?.map((f) => ({ ...f, id: `file-${++seq}` })),
      };
      return {
        ...s,
        products: [copy, ...s.products],
        versions: [
          ...s.versions,
          {
            id: `v-${++seq}`,
            productId: newId,
            number: 1,
            title: version.title,
            authorId: s.currentUserId,
            createdAt: "방금",
            changes: [{ field: "Version", from: "—", to: `V${version.number}에서 복제` }],
            snapshot: cloneSnapshot(snap),
          },
        ],
      };
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => {
      const item = s.products.find((p) => p.id === id);
      if (!item) return s;
      return {
        ...s,
        products: s.products.filter((p) => p.id !== id),
        comments: s.comments.filter((c) => c.productId !== id),
        trash: [
          {
            id: `t-${++seq}`,
            workspaceId: item.workspaceId,
            name: item.name,
            kind: "제품",
            deletedAt: "방금",
          },
          ...s.trash,
        ],
      };
    });
  }, []);

  const toggleItemFavorite = useCallback((kind: "product" | "asset", id: string) => {
    setState((s) =>
      kind === "product"
        ? {
            ...s,
            products: s.products.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
          }
        : {
            ...s,
            assets: s.assets.map((a) => (a.id === id ? { ...a, favorite: !a.favorite } : a)),
          },
    );
  }, []);

  const moveItemToFolder = useCallback((kind: "product" | "asset", id: string, folderId: string) => {
    setState((s) =>
      kind === "product"
        ? {
            ...s,
            products: s.products.map((p) => (p.id === id ? { ...p, folderId } : p)),
          }
        : {
            ...s,
            assets: s.assets.map((a) => (a.id === id ? { ...a, folderId } : a)),
          },
    );
  }, []);

  const restoreTrashItem = useCallback((id: string) => {
    setState((s) => {
      const item = s.trash.find((t) => t.id === id);
      if (!item) return s;
      return {
        ...s,
        trash: s.trash.filter((t) => t.id !== id),
        assets: [
          {
            id: `asset-${++seq}`,
            workspaceId: item.workspaceId,
            group: "production" as const,
            kind: item.kind,
            name: item.name,
            meta: "휴지통에서 복원",
            usedAt: "방금",
          },
          ...s.assets,
        ],
      };
    });
  }, []);

  const deleteTrashItem = useCallback((id: string) => {
    setState((s) => ({ ...s, trash: s.trash.filter((t) => t.id !== id) }));
  }, []);

  const updateStatus = useCallback((productId: string, status: ProductStatus) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === productId ? { ...p, status, updatedAt: "방금" } : p)),
      activities: [
        {
          id: `a-${++seq}`,
          productId,
          actorId: s.currentUserId,
          text: `${s.products.find((p) => p.id === productId)?.name ?? "Product"} 상태가 ${status.replaceAll("_", " ")}(으)로 변경되었습니다.`,
          createdAt: "방금",
        },
        ...s.activities,
      ],
    }));
  }, []);

  const updateProductSchedule = useCallback(
    (
      productId: string,
      patch: {
        status?: ProductStatus;
        dueDate?: string;
        sampleDue?: string;
        productionDue?: string;
        factory?: string;
      },
    ) => {
      setState((s) => ({
        ...s,
        products: s.products.map((p) => {
          if (p.id !== productId) return p;
          const identity = {
            ...p.specs.identity,
            ...(patch.sampleDue !== undefined ? { sampleDue: patch.sampleDue } : {}),
            ...(patch.productionDue !== undefined ? { productionDue: patch.productionDue } : {}),
          };
          return {
            ...p,
            status: patch.status ?? p.status,
            dueDate: patch.dueDate ?? p.dueDate,
            factory: patch.factory !== undefined ? patch.factory : p.factory,
            updatedAt: "방금",
            specs: { ...p.specs, identity },
          };
        }),
        activities: [
          {
            id: `a-${++seq}`,
            productId,
            actorId: s.currentUserId,
            text: `${s.products.find((p) => p.id === productId)?.name ?? "Product"} 일정·납기를 수정했습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      }));
    },
    [],
  );

  const updateSpecsField = useCallback((productId: string, updater: (p: Product) => Product) => {
    setState((s) => {
      const products = s.products.map((p) => (p.id === productId ? updater(p) : p));
      saveStoredProductFiles(products);
      return { ...s, products };
    });
  }, []);

  const addComment = useCallback((comment: Omit<Comment, "id" | "createdAt" | "authorId"> & { authorId?: string }) => {
    setState((s) => {
      const authorId = comment.authorId ?? s.currentUserId;
      return {
        ...s,
        comments: [
          {
            ...comment,
            id: `c-${++seq}`,
            authorId,
            createdAt: "방금",
          },
          ...s.comments,
        ],
        activities: [
          {
            id: `a-${++seq}`,
            productId: comment.productId,
            actorId: authorId,
            text: `${comment.context.label}에 Comment를 남겼습니다.`,
            createdAt: "방금",
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const convertToTask = useCallback((commentId: string, assigneeId: string) => {
    setState((s) => ({
      ...s,
      comments: s.comments.map((c) =>
        c.id === commentId ? { ...c, isTask: true, taskStatus: "open" as TaskStatus, assigneeId } : c,
      ),
    }));
  }, []);

  const setTaskStatus = useCallback((commentId: string, status: TaskStatus) => {
    setState((s) => ({
      ...s,
      comments: s.comments.map((c) => (c.id === commentId ? { ...c, taskStatus: status } : c)),
    }));
  }, []);

  const addNode = useCallback(
    (
      productId: string,
      type: CanvasNodeType,
      options?: { linkedTo?: string; boardKind?: "general" | "specs"; title?: string },
    ) => {
    const titles: Record<CanvasNodeType, string> = {
      flat: options?.boardKind === "specs" ? "Specs용 도식화" : options?.title ?? "일반 도식화",
      label: "Label",
      mockup2d: "2D Mockup",
      mockup3d: "3D Mockup",
    };
    setState((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id !== productId) return p;
        if (type === "flat") {
          const flats = p.nodes.filter((n) => n.type === "flat");
          const last = flats[flats.length - 1];
          const lastH = last?.h ?? 400;
          const node: CanvasNode = {
            id: `n-${++seq}`,
            type,
            title: options?.title ?? titles.flat,
            x: last?.x ?? 80,
            y: last ? last.y + 28 + lastH + 96 : 40,
            boardKind: options?.boardKind ?? "general",
          };
          return { ...p, nodes: [...p.nodes, node], updatedAt: "방금" };
        }
        const parent = options?.linkedTo ? p.nodes.find((n) => n.id === options.linkedTo && n.type === "flat") : undefined;
        if (!parent) return p;
        const parentW = parent.w ?? 374;
        const siblings = p.nodes.filter((n) => n.linkedTo === parent.id);
        const node: CanvasNode = {
          id: `n-${++seq}`,
          type,
          title: titles[type],
          x: parent.x + parentW + 100,
          y: parent.y + siblings.length * 290,
          linkedTo: parent.id,
        };
        return { ...p, nodes: [...p.nodes, node], updatedAt: "방금" };
      }),
    }));
  },
  []);

  const moveNode = useCallback((productId: string, nodeId: string, x: number, y: number) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id !== productId
          ? p
          : { ...p, nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)) },
      ),
    }));
  }, []);

  const updateNode = useCallback((productId: string, nodeId: string, patch: Partial<CanvasNode>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id !== productId
          ? p
          : { ...p, nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch, id: n.id } : n)) },
      ),
    }));
  }, []);

  const deleteNode = useCallback((productId: string, nodeId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id !== productId ? p : { ...p, nodes: p.nodes.filter((n) => n.id !== nodeId), updatedAt: "방금" },
      ),
    }));
  }, []);

  const hideNodePart = useCallback((productId: string, nodeId: string, partId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              nodes: p.nodes.map((n) =>
                n.id === nodeId
                  ? { ...n, hiddenParts: [...new Set([...(n.hiddenParts ?? []), partId])] }
                  : n,
              ),
              updatedAt: "방금",
            },
      ),
    }));
  }, []);

  const updateDisplayAccount = useCallback((name: string) => {
    const trimmed = name.trim();
    setState((s) => ({
      ...s,
      displayAccount: { ...s.displayAccount, name: trimmed || s.displayAccount.name },
    }));
  }, []);

  const updateAvatar = useCallback((avatar: VoxelAvatarConfig) => {
    setState((s) => ({ ...s, displayAccount: { ...s.displayAccount, avatar } }));
  }, []);

  const setMarketingConsent = useCallback((value: boolean) => {
    setState((s) => ({ ...s, marketingConsent: value }));
  }, []);

  const updateMaterialWeight = useCallback((productId: string, weight: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id !== productId) return p;
        const materials = p.specs.materials.map((m, i) => (i === 0 ? { ...m, weight } : m));
        return { ...p, specs: { ...p.specs, materials }, updatedAt: "방금" };
      }),
      activities: [
        {
          id: `a-${++seq}`,
          productId,
          actorId: s.currentUserId,
          text: `Main Fabric 무게가 ${weight}(으)로 변경되었습니다.`,
          createdAt: "방금",
        },
        ...s.activities,
      ],
    }));
  }, []);

  const value = useMemo<WorkspaceApi>(
    () => ({
      ...state,
      currentWorkspace,
      currentTeam,
      contextWorkspaces,
      workspaceProducts,
      workspaceAssets,
      getProduct,
      getProductByShareToken,
      getUser,
      ensureShareToken,
      setWorkspace,
      setTeamContext,
      createTeam,
      createWorkspace,
      createFolder,
      updateWorkspace,
      addWorkspaceStickers,
      patchWorkspaceSticker,
      removeWorkspaceSticker,
      deleteWorkspace,
      inviteMember,
      inviteToProduct,
      inviteToWorkspace,
      setCollaboratorAccess,
      removeCollaborator,
      setAnyoneAccess,
      setWorkspaceAccess,
      createProduct,
      createAsset,
      updateAsset,
      deleteAsset,
      duplicateProduct,
      deleteProduct,
      renameVersion,
      restoreVersion,
      duplicateVersion,
      duplicateAsset,
      toggleItemFavorite,
      moveItemToFolder,
      restoreTrashItem,
      deleteTrashItem,
      updateStatus,
      updateProductSchedule,
      updateSpecsField,
      addComment,
      convertToTask,
      setTaskStatus,
      addNode,
      moveNode,
      updateNode,
      deleteNode,
      hideNodePart,
      updateMaterialWeight,
      updateDisplayAccount,
      updateAvatar,
      setMarketingConsent,
    }),
    [
      state,
      currentWorkspace,
      currentTeam,
      contextWorkspaces,
      workspaceProducts,
      workspaceAssets,
      getProduct,
      getProductByShareToken,
      getUser,
      ensureShareToken,
      setWorkspace,
      setTeamContext,
      createTeam,
      createWorkspace,
      createFolder,
      updateWorkspace,
      addWorkspaceStickers,
      patchWorkspaceSticker,
      removeWorkspaceSticker,
      deleteWorkspace,
      inviteMember,
      inviteToProduct,
      inviteToWorkspace,
      setCollaboratorAccess,
      removeCollaborator,
      setAnyoneAccess,
      setWorkspaceAccess,
      createProduct,
      createAsset,
      updateAsset,
      deleteAsset,
      duplicateProduct,
      deleteProduct,
      renameVersion,
      restoreVersion,
      duplicateVersion,
      duplicateAsset,
      toggleItemFavorite,
      moveItemToFolder,
      restoreTrashItem,
      deleteTrashItem,
      updateStatus,
      updateProductSchedule,
      updateSpecsField,
      addComment,
      convertToTask,
      setTaskStatus,
      addNode,
      moveNode,
      updateNode,
      deleteNode,
      hideNodePart,
      updateMaterialWeight,
      updateDisplayAccount,
      updateAvatar,
      setMarketingConsent,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("WorkspaceProvider missing");
  return ctx;
}

export type CollabTab = "properties" | "comments" | "versions" | "activity";

export function useProductMode() {
  const [mode, setMode] = useState<Mode>("design");
  return { mode, setMode };
}
