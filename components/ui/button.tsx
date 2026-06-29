import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: Props) {
  return (
    <button
      className={`px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition ${className}`}
      {...props}
    />
  );
}
