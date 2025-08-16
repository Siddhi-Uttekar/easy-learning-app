import * as React from "react";
type DropzoneProps = {
  accept?: { [mime: string]: string[] };
  onDrop: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
};
export function Dropzone(props: DropzoneProps) {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    props.onDrop(files);
  };
  return (
    <div
      className={props.className}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInput.current?.click()}
      tabIndex={0}
      role="button"
    >
      {props.children}
      <input
        ref={fileInput}
        type="file"
        accept={Object.keys(props.accept || {}).join(",")}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) props.onDrop(Array.from(e.target.files));
        }}
      />
    </div>
  );
}
