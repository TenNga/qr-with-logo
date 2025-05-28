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
    <div style={{ padding: 40 }}>
      <h1>QR Code Generator with Custom Logo</h1>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-row justify-between items-center gap-4 box-border">
        <input
          className="border rounded-lg bg-white text-black grow-1"
          type="text"
          name="text"
          placeholder="Enter URL or text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 10, width: 300, marginBottom: 10 }}
          required
        />
        <input className="border rounded-lg p-4 bg-white text-black" type="file" name="logo" accept="image/*" required />
        <button type="submit" className="border rounded-lg p-4 bg-[grey]">Generate QR</button>
      </form>

      {qrUrl && (
        <div style={{ marginTop: 30 }}>
          <img src={qrUrl} alt="Generated QR" style={{ width: 300 }} />
          <br />
          <a href={qrUrl} download="qr.png">
            ⬇️ Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}
