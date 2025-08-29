import { useRef, useState } from "react";
const API_BASE = "https://func-mailjs.azurewebsites.net"; // no /api right now
const FUNCTION_KEY = "gBMH7oPqG80R7K0_sMj1iJ9tDW1ltu2uPtuwAY3JQJHmAzFu_DFcOg==";

export function useContactForm() {
  const formRef = useRef(null);
  const prevMsgLenRef = useRef(0);

  const [status, setStatus] = useState("");
  const [msgCount, setMsgCount] = useState(0);

  const markDirty = (e) => e.currentTarget.classList.add("dirty");

  const handleEmailInput = (e) => {
    markDirty(e);
    e.currentTarget.setCustomValidity("");
  };
  const handleEmailBlur = (e) => {
    const el = e.currentTarget;
    const v = el.value.trim();
    if (v === "") {
      el.setCustomValidity("");
      return;
    }
    const tld = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,63}$/;
    if (!el.checkValidity() || !tld.test(v)) {
      el.setCustomValidity("Enter a valid email like you@example.com");
      el.reportValidity();
      setTimeout(() => el.focus(), 0);
    } else el.setCustomValidity("");
  };
  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" && !e.currentTarget.checkValidity()) {
      e.preventDefault();
      e.currentTarget.reportValidity();
    }
  };

  const handleAliasInput = (e) => {
    const el = e.currentTarget;
    markDirty(e);
    const raw = el.value.trim();
    const aliasRe = /^(?![.])(?!.*[.]{2})[A-Za-z0-9._%+-]{1,64}(?<![.])$/;
    if (raw === "") {
      el.setCustomValidity("");
      return;
    }
    if (raw.includes("@")) {
      el.setCustomValidity("Enter only the alias (no @ or domain).");
      el.reportValidity();
      return;
    }
    if (el.value.includes("@")) {
      el.value = el.value.replaceAll("@", "");
      el.setCustomValidity("Do not include @ or a domain.");
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 900);
      return;
    }
    if (!aliasRe.test(raw)) {
      el.setCustomValidity(
        "Allowed: letters, numbers, . _ % + - ; max 64; no leading/trailing/double dots."
      );
      el.reportValidity();
      return;
    }
    el.setCustomValidity("");
  };

  // BLOCK @ before it hits the input (typing/IME)
  const blockAliasAtBeforeInput = (e) => {
    const data = e.nativeEvent?.data || "";
    if (data.includes("@")) {
      e.preventDefault();
      const el = e.currentTarget;
      el.classList.add("dirty");
      el.setCustomValidity(
        "Do not include @ or a domain. Enter only the alias."
      );
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 900);
    }
  };

  // Fallback for key presses that don’t fire beforeinput
  const blockAliasAtKeyDown = (e) => {
    if (e.key === "@") {
      e.preventDefault();
      const el = e.currentTarget;
      el.classList.add("dirty");
      el.setCustomValidity(
        "Do not type @ here — this field is only the alias."
      );
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 900);
    }
  };

  // Clean up pasted text that contains @
  const handleAliasPaste = (e) => {
    const text =
      (e.clipboardData || window.clipboardData)?.getData("text") || "";
    if (text.includes("@")) {
      e.preventDefault();
      const cleaned = text.replaceAll("@", "");
      const el = e.currentTarget;
      el.setRangeText(cleaned, el.selectionStart, el.selectionEnd, "end");
      el.classList.add("dirty");
      el.setCustomValidity("Removed @ — enter only the alias portion.");
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 900);
    }
  };

  const handleMessageInput = (e) => {
    const el = e.currentTarget;
    markDirty(e);
    const LIMIT = 1000;
    if (el.value.length > LIMIT) el.value = el.value.slice(0, LIMIT);
    if (el.value.length >= LIMIT && prevMsgLenRef.current < LIMIT) {
      el.setCustomValidity("You've reached the 1000 character limit.");
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 800);
    }
    prevMsgLenRef.current = el.value.length;
    setMsgCount(el.value.length);
  };

  const handleMessagePaste = (e) => {
    const el = e.currentTarget;
    const LIMIT = 1000;
    const sel = el.selectionEnd - el.selectionStart;
    const baseLen = el.value.length - sel;
    const text =
      (e.clipboardData || window.clipboardData).getData("text") || "";
    const room = LIMIT - baseLen;
    if (text.length > room) {
      e.preventDefault();
      el.setRangeText(
        text.slice(0, Math.max(room, 0)),
        el.selectionStart,
        el.selectionEnd,
        "end"
      );
      el.setCustomValidity("Max 1000 characters.");
      el.reportValidity();
      setTimeout(() => el.setCustomValidity(""), 800);
      setMsgCount(el.value.length);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    formRef.current.classList.add("wasValidated");
    if (!formRef.current.reportValidity()) {
      setStatus("Please fix the highlighted fields.");
      return;
    }

    setStatus("Sending...");
    const form = new FormData(formRef.current);
    const body = {
      from_name: form.get("from_name") || "",
      reply_to: form.get("reply_to") || "",
      alias: form.get("alias") || "",
      message: form.get("message") || "",
    };

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const FUNCTION_KEY = import.meta.env.VITE_FUNCTION_KEY || "";
      // build the URL: add ?code= only when not localhost
      const isPublic = API_BASE && !API_BASE.includes("localhost");
      const url = `${API_BASE}/sendmail${isPublic && FUNCTION_KEY ? `?code=${encodeURIComponent(FUNCTION_KEY)}` : ""}`;

      const res = await fetch(`${API_BASE}/sendmail?code=${encodeURIComponent(FUNCTION_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(await res.text().catch(() => res.statusText));
      setStatus("Sent!");
      formRef.current?.reset();
      formRef.current.classList.remove("wasValidated");
      prevMsgLenRef.current = 0;
      setMsgCount(0);
    } catch (error) {
      console.error("Email send failed:", error); // Shows real error in console
      setStatus("Send failed: " + (error.message || "unknown")); // Shows actual cause in UI
      setStatusType("error");
    }
  };

  return {
    formRef,
    status,
    msgCount,
    markDirty,
    handleEmailInput,
    handleEmailBlur,
    handleEmailKeyDown,
    handleAliasInput,
    handleAliasPaste,
    blockAliasAtBeforeInput,
    blockAliasAtKeyDown,
    handleMessageInput,
    handleMessagePaste,
    sendEmail,
  };
}
