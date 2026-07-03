import { useEffect, useCallback } from "react";

const DRAFT_KEY = "notary-note-draft";

/**
 * Auto-saves note draft to localStorage.
 * Call saveDraft(note) to persist, loadDraft() to retrieve, clearDraft() to wipe.
 */
export function useDraft() {
    const saveDraft = useCallback((note) => {
        if (!note.title && !note.content) return;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...note, savedAt: Date.now() }));
    }, []);

    const loadDraft = useCallback(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(DRAFT_KEY);
    }, []);

    return { saveDraft, loadDraft, clearDraft };
}
