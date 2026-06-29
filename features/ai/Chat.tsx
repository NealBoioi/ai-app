"use client";

import { useState } from "react";
import { useChat } from "./useChat";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { messages, sendMessage, loading } = useChat();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 space-y-4">
      <div className="border rounded-2xl p-4 h-[400px] overflow-y-auto bg-white">
        {messages.length === 0 && (
          <p className="text-gray-500">Start a conversation...</p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-xl ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-sm text-gray-400">AI is typing...</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-4 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />

        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}