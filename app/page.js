'use client';

import { useRef, useState } from 'react';

export default function Home() {
  const vmgfilesInput = useRef(null);
  const [preview, setPreview] = useState("Preview of the JSON file will be here.");
  const [disabledDownload, setDisabledDownload] = useState(true);
  
  const toDecodeURI = (text, numCharToDelete) => {
    try {
      return decodeURI(text.slice(0, -numCharToDelete));
    } catch {
      return false;
    }
  };

  const outputPreview = (vmgFilesText) => {
    try {
      let previewText = "[";

      for (let i = 0; i < vmgFilesText.length; i++) {
        const date = vmgFilesText[i].match(/Date:([\s\S]+)\r\nTEXT;/)[1];
        const cell = vmgFilesText[i].match(/CELL:([\s\S]+)\r\nX-ANNI/)[1];
        const textEncoded = vmgFilesText[i].match(/QUOTED-PRINTABLE:([\s\S]+)END:VBODY/)[1];
        const textBeforeDecoded = textEncoded.replaceAll("=\r\n", "").replaceAll("%", "=25").replaceAll("=", "%");

        let textDecoded = "";

        for (let j = 2; j <= textBeforeDecoded.length; j++) {
          if (toDecodeURI(textBeforeDecoded, j)) {
            textDecoded = toDecodeURI(textBeforeDecoded, j);
            if (j > 2) textDecoded += textBeforeDecoded.slice(-j, -2);
            break;
          }
        }
        textDecoded = textDecoded.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\r", "\\r").replaceAll("\n", "\\n");
        if (i != 0) previewText += `,\n`;
        previewText += `{"date": "${date}", "cell": "${cell}", "body": "${textDecoded}"}`;
      }
      previewText += "]";
      setDisabledDownload(false);
      return previewText;
    } catch {
      return "Can't convert the file(s).";
    }
  };
  
  const toJSON = (blobData, filename) => {
    const blob = new Blob([blobData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInput = async (e) => {
    const vmgFiles = e.target.files;
    let vmgFilesText = [];
  
    for (let i = 0; i < vmgFiles.length; i++) {
      vmgFilesText.push(await vmgFiles[i].text());
    }

    vmgFilesText.length && setPreview(outputPreview(vmgFilesText));
  };
  
  const handleClear = () => {
    vmgfilesInput.current.value = null;
    setDisabledDownload(true);
    setPreview("Preview of the JSON file will be here.");
  };
  
  const handleDownload = () => {
    const blobData = preview;
    
    toJSON(blobData, "sms.json");
  };
  
  return (<>
    <main>
      <img src="conversation.flaticon.png" className="position-absolute top-0 start-50 translate-middle-x" />
      <h1 className="text-center text-light mt-5 pt-3 pb-3 rounded-4 position-relative bg-dark bg-opacity-75">
        VMG to JSON
      </h1>
      <div className="border border-3 rounded-4 position-relative">
        <div className="d-flex py-3 mx-5">
          <input type="file" multiple ref={vmgfilesInput} className="form-control" onInput={handleInput} />
          <button id="clear-btn" className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
        </div>
        <div id="preview" className="overflow-scroll border rounded-4 p-3 mx-5 mb-3 bg-white">
          {preview}
        </div>
        <div className="d-flex">
          <button id="download-btn" className="btn btn-primary form-control mx-5 mb-3" disabled={disabledDownload} onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </main>
    <footer className="p-3 rounded-4 position-relative bg-dark bg-opacity-75">
      <a href="https://www.flaticon.com/free-icons/sms" title="sms icons" className="link-light">
        Sms icons created by Creative Stall Premium - Flaticon
      </a>
    </footer>
  </>);
}