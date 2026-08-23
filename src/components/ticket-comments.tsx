"use client";

import React, { useState } from "react";
import { TicketComment, UserProfile } from "@/lib/types";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { addTicketComment } from "@/lib/firestore-service";
import { Lock, Send, User } from "lucide-react";

interface TicketCommentsProps {
  ticketId: string;
  comments: TicketComment[];
  currentUser: UserProfile;
  onCommentAdded: (comment: TicketComment) => void;
}

export function TicketComments({
  ticketId,
  comments = [],
  currentUser,
  onCommentAdded,
}: TicketCommentsProps) {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStaffOrManager =
    currentUser.role === "staff" || currentUser.role === "manager";

  // Filter visible comments: employees don't see internal notes
  const visibleComments = comments.filter((c) => {
    if (c.isInternal && currentUser.role === "employee") {
      return false;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addTicketComment(
        ticketId,
        {
          uid: currentUser.uid,
          name: currentUser.name,
          role: currentUser.role,
        },
        text,
        isStaffOrManager ? isInternal : false
      );
      onCommentAdded(newComment);
      setText("");
      setIsInternal(false);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Comments List */}
      <div className="space-y-3">
        {visibleComments.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground text-center py-6">
            No dispatch log entries or field notes recorded.
          </p>
        ) : (
          visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-md border p-3.5 text-xs transition-colors ${
                comment.isInternal
                  ? "bg-primary/5 border-primary/40"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-foreground flex items-center font-sans">
                    <User className="mr-1 h-3 w-3 opacity-60" />
                    {comment.authorName}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {comment.authorRole}
                  </Badge>
                  {comment.isInternal && (
                    <Badge variant="oxblood" className="text-[10px] font-mono flex items-center">
                      <Lock className="mr-1 h-2.5 w-2.5" />
                      Internal Note
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {formatRelativeDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Box */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-3 border-t border-border/60">
        <Textarea
          placeholder={
            isInternal
              ? "Record internal field note (restricted to staff & managers)..."
              : "Post an update or question on this work order..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="text-xs bg-background"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          {isStaffOrManager ? (
            <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer select-none font-sans">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded-xs border-input text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="flex items-center">
                <Lock className="mr-1 h-3 w-3 text-secondary" />
                Staff Internal Note
              </span>
            </label>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || submitting}
            className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
          >
            <Send className="h-3 w-3" />
            <span>{submitting ? "Logging..." : "Log Entry"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
