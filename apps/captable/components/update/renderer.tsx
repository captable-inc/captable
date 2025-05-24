import "@blocknote/react/style.css";
import "@/styles/editor.css";
import DOMPurify from "dompurify";

type UpdatesEditorProps = {
  html: string;
};

const UpdateRenderer = ({ html }: UpdatesEditorProps) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  // biome-ignore lint/security/noDangerouslySetInnerHtml: We have sanitized the html
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};

export default UpdateRenderer;
