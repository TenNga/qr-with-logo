"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setQrUrl(url);
  };

  return (
    <div className="bg-gray-100 w-full h-screen flex flex-col items-center justify-center text-black">
      <h1 className="text-7xl font-black mb-12">QR Code Generator with Custom Logo</h1>
      <div className="flex items-center gap-8 w-[70vw]">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-row justify-between items-center gap-4 box-border w-full h-full bg-white rounded-lg">
          <div className="flex flex-col items-start gap-2 rounded-lg p-8 w-full">
            <label htmlFor="text" className="text-2xl font-bold w-full">Website URL</label>
            <input
              className="border rounded-lg bg-white text-black grow-1 w-full p-4"
              type="text"
              name="text"
              placeholder="Enter URL or text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <div className="flex flex-col items-center justify-center text-center gap-2 w-full mb-8 text-left">
              <label htmlFor="logo" className="text-2xl font-bold w-full">Logo:<span className="font-thin italic">(Optional)</span></label>
              <input className="border rounded-lg p-4 bg-white text-black w-full cursor-pointer" type="file" name="logo" accept="image/*" placeholder="File Upload" />
            </div>
            <button type="submit" className="border rounded-lg p-4 bg-blue-500 text-white font-bold w-full hover:border-black cursor-pointer">Generate QR</button>
          </div>
        </form>
        {!qrUrl && (
          <div className="text-2xl font-bold grow w-full">
            <img src="/example.png" alt="Generated QR" className="w-fit h-[80%]"/>
            <br />
            <a href="/example.png" download="qr.png" className="border rounded-lg p-4 block text-center hover:bg-gray-900 transition-colors duration-300 hover:text-white">
              ⬇️ Download
            </a>
          </div>
        )}
        {qrUrl && (
          <div className="text-2xl font-bold grow w-full">
            <img src={qrUrl} alt="Generated QR" className="w-fit h-[80%]" />
            <br />
            <a href={qrUrl} download="qr.png" className="border rounded-lg p-4 block text-center hover:bg-gray-900 transition-colors duration-300 hover:text-white">
              ⬇️ Download
            </a>
          </div>
        )}
      </div>

    </div>
  );
}
