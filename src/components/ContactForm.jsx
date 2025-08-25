import React from "react";
import "./ContactForm.css";
import { useContactForm } from "../hooks/useContactForm";

export default function ContactForm() {
  const {
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
  } = useContactForm();

  return (
    <form ref={formRef} onSubmit={sendEmail} className="contactForm">
      <div className="formGroup">
        <label htmlFor="from_name" className="label">
          Your name
        </label>
        <input
          id="from_name"
          name="from_name"
          className="input"
          required
          maxLength={64}
          onInput={markDirty}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="reply_to" className="label">
          Your Current Email (we’ll use this to contact you)
        </label>
        <input
          id="reply_to"
          name="reply_to"
          type="email"
          className="input"
          required
          placeholder="you@example.com"
          onInput={handleEmailInput}
          onBlur={handleEmailBlur}
          onKeyDown={handleEmailKeyDown}
        />
      </div>

      <div className="formGroup">
        <label htmlFor="new_mail" className="label">
          Desired Email Alias (you’ll get @tyranny.sucks)
        </label>
        <input
          id="new_mail"
          name="new_mail"
          type="text"
          className="input"
          required
          placeholder="e.g. FDT8647"
          maxLength={64}
          onBeforeInput={blockAliasAtBeforeInput}
          onKeyDown={blockAliasAtKeyDown}
          onPaste={handleAliasPaste}
          onInput={handleAliasInput}
          autoComplete="off"
          inputMode="latin"
        />
      </div>

      <div className="formGroup">
        <label htmlFor="message" className="label">
          Your Message (max 1000)
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea"
          required
          maxLength={1000}
          onInput={handleMessageInput}
          onPaste={handleMessagePaste}
          placeholder="Type your message here..."
        />
        <div className="charCount">{msgCount} / 1000</div>
      </div>

      <button type="submit" className="submitButton">
        Send
      </button>
      <div className="status">{status}</div>
    </form>
  );
}
