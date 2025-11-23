"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Plus, Sparkles, AlertTriangle, Loader2 } from "lucide-react";

interface EventFormProps {
  event?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

interface FormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  participants: string[];
  location: string;
  meetingLink: string;
}

interface FormErrors {
  [key: string]: string;
}

export function EventForm({ event, onSubmit, onCancel, mode }: EventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event?.startTime
      ? new Date(event.startTime).toISOString().split("T")[0]
      : "",
    startTime: event?.startTime
      ? new Date(event.startTime).toTimeString().slice(0, 5)
      : "",
    endDate: event?.endTime
      ? new Date(event.endTime).toISOString().split("T")[0]
      : "",
    endTime: event?.endTime
      ? new Date(event.endTime).toTimeString().slice(0, 5)
      : "",
    participants: event?.participants || [],
    location: event?.location || "",
    meetingLink: event?.meetingLink || "",
  });

  const [participantEmail, setParticipantEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for conflicts when date/time changes
  useEffect(() => {
    if (
      formData.startDate &&
      formData.startTime &&
      formData.endDate &&
      formData.endTime
    ) {
      checkConflicts();
    }
  }, [
    formData.startDate,
    formData.startTime,
    formData.endDate,
    formData.endTime,
  ]);

  const checkConflicts = async () => {
    setIsCheckingConflicts(true);
    try {
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const response = await fetch("/api/scheduling/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          participants: formData.participants,
          excludeEventId: event?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsGettingSuggestions(true);
    try {
      const response = await fetch("/api/scheduling/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: formData.participants,
          duration: 60, // default 1 hour
          preferredTimes: ["morning", "afternoon"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          const bestSlot = data.suggestions[0];
          const start = new Date(bestSlot.startTime);
          const end = new Date(bestSlot.endTime);

          setFormData({
            ...formData,
            startDate: start.toISOString().split("T")[0],
            startTime: start.toTimeString().slice(0, 5),
            endDate: end.toISOString().split("T")[0],
            endTime: end.toTimeString().slice(0, 5),
          });
        }
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (formData.participants.length === 0) {
      newErrors.participants = "At least one participant is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddParticipant = () => {
    const email = participantEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setErrors({ ...errors, participantEmail: "Email is required" });
      return;
    }

    if (!emailRegex.test(email)) {
      setErrors({ ...errors, participantEmail: "Invalid email format" });
      return;
    }

    if (formData.participants.includes(email)) {
      setErrors({ ...errors, participantEmail: "Email already added" });
      return;
    }

    setFormData({
      ...formData,
      participants: [...formData.participants, email],
    });
    setParticipantEmail("");
    setErrors({ ...errors, participantEmail: "" });
  };

  const handleRemoveParticipant = (email: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== email),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const submitData = {
        ...formData,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Meeting title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Meeting description and agenda"
          rows={3}
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className={errors.startDate ? "border-red-500" : ""}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">
            Start Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            className={errors.startTime ? "border-red-500" : ""}
          />
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className={errors.endDate ? "border-red-500" : ""}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">
            End Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            className={errors.endTime ? "border-red-500" : ""}
          />
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* AI Suggestion Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetSuggestions}
        disabled={
          isGettingSuggestions || formData.participants.length === 0
        }
        className="gap-2"
      >
        {isGettingSuggestions ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Get AI Time Suggestions
      </Button>

      {/* Participants */}
      <div className="space-y-2">
        <Label htmlFor="participantEmail">
          Participants <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="participantEmail"
            type="email"
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddParticipant();
              }
            }}
            placeholder="email@example.com"
            className={errors.participantEmail ? "border-red-500" : ""}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddParticipant}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.participantEmail && (
          <p className="text-sm text-red-500">{errors.participantEmail}</p>
        )}
        {errors.participants && formData.participants.length === 0 && (
          <p className="text-sm text-red-500">{errors.participants}</p>
        )}

        {/* Participant Chips */}
        {formData.participants.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.participants.map((email) => (
              <div
                key={email}
                className="inline-flex items-center gap-2 px-3 py-1 bg-astralis-blue/10 text-astralis-blue rounded-full text-sm"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(email)}
                  className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Meeting room or address"
        />
      </div>

      {/* Meeting Link */}
      <div className="space-y-2">
        <Label htmlFor="meetingLink">Meeting Link</Label>
        <Input
          id="meetingLink"
          type="url"
          value={formData.meetingLink}
          onChange={(e) =>
            setFormData({ ...formData, meetingLink: e.target.value })
          }
          placeholder="https://zoom.us/j/..."
        />
      </div>

      {/* Conflict Warning */}
      {isCheckingConflicts && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Checking for conflicts...</AlertTitle>
        </Alert>
      )}

      {!isCheckingConflicts && conflicts.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Scheduling Conflicts Detected</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm">
                  {conflict.title} ({new Date(conflict.startTime).toLocaleTimeString()} -{" "}
                  {new Date(conflict.endTime).toLocaleTimeString()})
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isCheckingConflicts}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </div>
    </form>
  );
}
