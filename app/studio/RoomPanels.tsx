import { useState, type ReactNode } from "react";

export default function RoomPanels({ children, coordinator = false }: { children: ReactNode; coordinator?: boolean }) {
  const [materials, setMaterials] = useState(false);
  return <div className={"studio-workroom room-panels" + (coordinator ? " studio-coordinator-room" : "")} data-materials={materials}>
    <div className="room-switch" role="group" aria-label="상담 화면 선택">
      <button aria-pressed={!materials} onClick={() => setMaterials(false)}>대화</button>
      <button aria-pressed={materials} onClick={() => setMaterials(true)}>상담 자료</button>
    </div>
    {children}
  </div>;
}
