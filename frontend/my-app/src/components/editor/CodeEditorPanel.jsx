import React from "react";
import { Form } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import { editorLanguageMap } from "../../constants/editorConstants";

export default function CodeEditorPanel({
  language,
  setLanguage,
  currentCode,
  onChange,
  isDarkTheme,
}) {
  return (
    <>
      <div className="editor-code-header">
        <div className="editor-code-header-left">
          <span className="editor-code-title">Code</span>
        </div>

        <div className="editor-code-header-right">
          <Form.Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="editor-language-select"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </Form.Select>
        </div>
      </div>

      <div className="editor-monaco-wrap">
        <Editor
          height="100%"
          language={editorLanguageMap[language]}
          value={currentCode}
          onChange={onChange}
          theme={isDarkTheme ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16 },
          }}
        />
      </div>
    </>
  );
}