export type ProductStatus =
  | "planning"
  | "designing"
  | "design_review"
  | "design_approved"
  | "specs_in_progress"
  | "specs_review"
  | "production_ready"
  | "approved"
  | "sent_to_factory";

export type Role = "admin" | "member" | "designer" | "production" | "reviewer" | "guest";

export type Mode = "design" | "specs";

export type CanvasNodeType = "flat" | "label" | "mockup2d" | "mockup3d";

export type ProductCategory =
  | "hoodie"
  | "tee"
  | "pants"
  | "jacket"
  | "shirt"
  | "knit"
  | "skirt"
  | "vest";

export type TaskStatus = "open" | "in_progress" | "resolved";

export interface User {
  id: string;
  name: string;
  title: string;
  role: Role;
  initials: string;
  color: string;
  email?: string;
}

export type ProductAccessRole = "owner" | "assignee" | "edit" | "comment" | "view";
export type LinkAccess = "none" | "view" | "comment" | "edit";
export type TeamAccess = "none" | "access";

export interface ProductCollaborator {
  userId: string;
  access: ProductAccessRole;
}

export const ACCESS_ROLE_LABEL: Record<ProductAccessRole, string> = {
  owner: "소유자",
  assignee: "담당",
  edit: "편집 가능",
  comment: "댓글 가능",
  view: "보기 가능",
};

export const LINK_ACCESS_LABEL: Record<LinkAccess, string> = {
  none: "없음",
  view: "보기 가능",
  comment: "댓글 가능",
  edit: "편집 가능",
};

export const TEAM_ACCESS_LABEL: Record<TeamAccess, string> = {
  none: "접근 없음",
  access: "접근 가능",
};

export const INVITE_ROLES: ProductAccessRole[] = ["edit", "comment", "view"];
export const MEMBER_ROLES: ProductAccessRole[] = ["edit", "comment", "view"];
export const LINK_ACCESS_OPTIONS: LinkAccess[] = ["view", "none", "comment", "edit"];
export const TEAM_ACCESS_OPTIONS: TeamAccess[] = ["access", "none"];

export interface Collection {
  id: string;
  name: string;
  season: string;
  year: string;
  description: string;
}

export type WorkspaceKind = "personal" | "team";

export interface Team {
  id: string;
  name: string;
  initial: string;
  color: string;
  memberIds: string[];
  locked?: boolean;
}

export interface Workspace {
  id: string;
  teamId: string | null;
  kind: WorkspaceKind;
  name: string;
  initial: string;
  color: string;
  memberIds: string[];
  locked?: boolean;
  favorite?: boolean;
  sizeLabel?: string;
  coverImage?: string;
  coverImageX?: number;
  coverImageY?: number;
  stickers?: WorkspaceSticker[];
  folders?: { id: string; name: string }[];
}

export interface WorkspaceSticker {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  rotate: number;
}

export interface LibraryAsset {
  id: string;
  workspaceId: string;
  group: "design" | "production";
  kind: string;
  name: string;
  meta: string;
  uploaded?: boolean;
  usedAt?: string;
  favorite?: boolean;
  folderId?: string;
  data?: unknown;
}

export interface TrashedItem {
  id: string;
  workspaceId: string;
  name: string;
  kind: string;
  deletedAt: string;
}

export interface Material {
  id: string;
  name: string;
  composition: string;
  weight: string;
  supplier: string;
  color: string;
  position?: string;
  consumption?: string;
  colorName?: string;
  yardage?: string;
  price?: string;
  memo?: string;
  status?: string;
  image?: string;
}

export interface TrimItem {
  id: string;
  name: string;
  type: string;
  spec: string;
  color: string;
  position?: string;
  qty?: string;
  attach?: string;
  yardage?: string;
  price?: string;
  memo?: string;
  status?: string;
  image?: string;
}

export interface LabelSpec {
  id: string;
  kind: "main" | "size" | "care" | "brand";
  name: string;
  material: string;
  size: string;
  position: string;
  image?: string;
}

export interface Colorway {
  id: string;
  name: string;
  main: string;
  sub: string;
  code: string;
  hex: string;
  qtyBySize?: Record<string, number>;
  memo?: string;
}

export interface MeasurementRow {
  pom: string;
  label: string;
  xs?: string;
  s?: string;
  m?: string;
  l?: string;
  xl?: string;
  values?: Record<string, number>;
  /** Size-to-size grading increment in cm. */
  grade?: number;
  tolerance: string;
}

export interface SpecAttribute {
  id: string;
  label: string;
  value: string;
}

export interface SpecIdentity {
  brand?: string;
  item?: string;
  gender?: string;
  season?: string;
  sampleDue?: string;
  productionDue?: string;
  manager?: string;
  extras?: SpecAttribute[];
}

export interface ProductSpecs {
  description: string;
  identity?: SpecIdentity;
  materials: Material[];
  trims: TrimItem[];
  labels: LabelSpec[];
  colorways: Colorway[];
  sizeRange: string[];
  measurements: MeasurementRow[];
  artwork: { title: string; technique: string; size: string; position: string; color: string }[];
  quantity: { size: string; qty: number }[];
  packaging: { title: string; note: string }[];
  notes: { title: string; body: string }[];
  /** WYSIWYG HTML for packaging, care, and other factory notes. */
  misc?: string;
  /** A4 slide board for 기타. */
  miscBoard?: MiscPage[];
  /** Tech Pack-only blocks (표/메모). Not linked to Design. */
  packExtras?: PackExtra[];
  /** Visible Tech Pack columns for 원단·부자재. */
  packItemColumns?: {
    fabric?: string[];
    trim?: string[];
  };
}

export type PackExtraKind = "table" | "memo";

export interface PackExtra {
  id: string;
  kind: PackExtraKind;
  title: string;
  body?: string;
  table?: { head: string[]; rows: string[][] };
}

export type MiscObjectType = "text" | "image" | "arrow" | "note";
export type MiscArrowStyle = "straight" | "double" | "dashed" | "line" | "curve";

export interface MiscBoxObject {
  id: string;
  type: "text" | "image" | "note";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  src?: string;
}

export interface MiscArrowObject {
  id: string;
  type: "arrow";
  x: number;
  y: number;
  x2: number;
  y2: number;
  style?: MiscArrowStyle;
}

export type MiscObject = MiscBoxObject | MiscArrowObject;

export interface MiscPage {
  id: string;
  title: string;
  orient?: "portrait" | "landscape";
  objects: MiscObject[];
}

export type CanvasGenerateKind = "image" | "svg";

export interface CanvasGenerate {
  kind: CanvasGenerateKind;
  version: number;
  revised?: boolean;
  /** Parent 디자인 보드 when this node is an SVG extract. */
  sourceBoardId?: string;
}

export interface GeneratePrompt {
  id: string;
  text: string;
  boardId: string;
  action: "create" | "edit";
  createdAt: string;
}

export interface AddNodeOptions {
  linkedTo?: string;
  boardKind?: "general" | "specs";
  title?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  imageSrc?: string;
  generate?: CanvasGenerate;
}

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  title: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  hiddenParts?: string[];
  linkedTo?: string;
  boardKind?: "general" | "specs";
  usedMaterialIds?: string[];
  usedTrimIds?: string[];
  usedMeasurementPoms?: string[];
  imageSrc?: string;
  generate?: CanvasGenerate;
}

export interface Comment {
  id: string;
  productId: string;
  authorId: string;
  body: string;
  mentions: string[];
  context: { mode: Mode; target: string; label: string };
  createdAt: string;
  isTask?: boolean;
  taskStatus?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}

export interface VersionSnapshot {
  nodes: CanvasNode[];
  specs: ProductSpecs;
}

export interface Version {
  id: string;
  productId: string;
  number: number;
  title: string;
  authorId: string;
  createdAt: string;
  changes: { field: string; from: string; to: string }[];
  snapshot?: VersionSnapshot;
}

export interface Activity {
  id: string;
  productId?: string;
  actorId: string;
  text: string;
  createdAt: string;
}

export interface ProductFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  src: string;
  source: "design" | "specs";
  kind?: "label" | "print";
  purpose?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  workspaceId: string;
  collectionId: string;
  category: ProductCategory;
  status: ProductStatus;
  ownerId: string;
  designerId: string;
  productionManagerId: string;
  collaboratorIds?: string[];
  factory?: string;
  dueDate: string;
  version: number;
  updatedAt: string;
  productionReady: number;
  completed: string[];
  missing: string[];
  specs: ProductSpecs;
  files?: ProductFile[];
  generatePrompts?: GeneratePrompt[];
  nodes: CanvasNode[];
  collaborators: ProductCollaborator[];
  anyoneAccess: LinkAccess;
  workspaceAccess: TeamAccess;
  shareToken?: string;
  favorite?: boolean;
  folderId?: string;
}

export const STATUS_META: Record<
  ProductStatus,
  { label: string; tone: string; ink: string }
> = {
  planning: { label: "Planning", tone: "bg-mist", ink: "text-stone" },
  designing: { label: "Designing", tone: "bg-sky", ink: "text-sky-ink" },
  design_review: { label: "Design Review", tone: "bg-butter", ink: "text-butter-ink" },
  design_approved: { label: "Design Approved", tone: "bg-lilac", ink: "text-lilac-ink" },
  specs_in_progress: { label: "Specs In Progress", tone: "bg-peach", ink: "text-peach-ink" },
  specs_review: { label: "Specs Review", tone: "bg-rose", ink: "text-rose-ink" },
  production_ready: { label: "Production Ready", tone: "bg-mint", ink: "text-mint-ink" },
  approved: { label: "Approved", tone: "bg-mint", ink: "text-mint-ink" },
  sent_to_factory: { label: "Sent to Factory", tone: "bg-ink text-snow", ink: "text-snow" },
};

export const STATUS_FLOW: ProductStatus[] = [
  "planning",
  "designing",
  "design_review",
  "design_approved",
  "specs_in_progress",
  "specs_review",
  "production_ready",
  "approved",
  "sent_to_factory",
];

