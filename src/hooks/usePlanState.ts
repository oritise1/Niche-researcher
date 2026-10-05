import { useCallback, useReducer } from "react";
import type {
  AppState,
  Intake,
  Notes,
  Plan,
  ScoreKey,
  Listing,
  Signal,
} from "../lib/types";
import {
  defaultIntake,
  defaultNotes,
  blankListing,
  blankSignal,
  loadState,
} from "../lib/storage";

export type Action =
  | { type: "SET_INTAKE_FIELD"; key: keyof Intake; value: string }
  | { type: "SET_NOTES_FIELD"; path: string; value: unknown }
  | { type: "SET_VIEW"; view: AppState["view"] }
  | { type: "BUILD_PLAN"; plan: Plan; notes: Notes }
  | { type: "ADD_LISTING"; phaseId: string }
  | { type: "REMOVE_LISTING"; phaseId: string; index: number }
  | { type: "ADD_SIGNAL"; phaseId: string }
  | { type: "REMOVE_SIGNAL"; phaseId: string; index: number }
  | { type: "SET_SCORE"; key: ScoreKey; value: number }
  | { type: "SET_TIMER"; timer: Notes["timer"] }
  | { type: "RESET" }
  | {
      type: "PATCH_LISTING";
      phaseId: string;
      index: number;
      patch: Partial<Listing>;
    }
  | {
      type: "PATCH_SIGNAL";
      phaseId: string;
      index: number;
      patch: Partial<Signal>;
    };

function setPath<T>(obj: T, path: string, value: unknown): T {
  const ks = path.split(".");
  const last = ks.pop()!;
  const clone = structuredClone(obj) as Record<string, unknown>;
  let t: Record<string, unknown> = clone;
  for (const k of ks) t = t[k] as Record<string, unknown>;
  t[last] = value;
  return clone as T;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_INTAKE_FIELD":
      return {
        ...state,
        intake: { ...state.intake, [action.key]: action.value },
      };

    case "SET_NOTES_FIELD": {
      if (!state.notes) return state;
      return {
        ...state,
        notes: setPath(state.notes, action.path, action.value),
      };
    }

    case "SET_VIEW":
      return { ...state, view: action.view };

    case "BUILD_PLAN":
      return {
        view: "plan",
        intake: state.intake,
        plan: action.plan,
        notes: action.notes,
      };
    case "PATCH_LISTING": {
      if (!state.notes) return state;
      const list = [...(state.notes.listingLogs[action.phaseId] ?? [])];
      list[action.index] = { ...list[action.index], ...action.patch };
      return {
        ...state,
        notes: {
          ...state.notes,
          listingLogs: { ...state.notes.listingLogs, [action.phaseId]: list },
        },
      };
    }
    case "PATCH_SIGNAL": {
      if (!state.notes) return state;
      const list = [...(state.notes.signalLogs[action.phaseId] ?? [])];
      list[action.index] = { ...list[action.index], ...action.patch };
      return {
        ...state,
        notes: {
          ...state.notes,
          signalLogs: { ...state.notes.signalLogs, [action.phaseId]: list },
        },
      };
    }
    case "ADD_LISTING": {
      if (!state.notes) return state;
      const list = state.notes.listingLogs[action.phaseId] ?? [];
      return {
        ...state,
        notes: {
          ...state.notes,
          listingLogs: {
            ...state.notes.listingLogs,
            [action.phaseId]: [...list, blankListing()],
          },
        },
      };
    }

    case "REMOVE_LISTING": {
      if (!state.notes) return state;
      const list = [...(state.notes.listingLogs[action.phaseId] ?? [])];
      list.splice(action.index, 1);
      if (!list.length) list.push(blankListing());
      return {
        ...state,
        notes: {
          ...state.notes,
          listingLogs: { ...state.notes.listingLogs, [action.phaseId]: list },
        },
      };
    }

    case "ADD_SIGNAL": {
      if (!state.notes) return state;
      const list = state.notes.signalLogs[action.phaseId] ?? [];
      return {
        ...state,
        notes: {
          ...state.notes,
          signalLogs: {
            ...state.notes.signalLogs,
            [action.phaseId]: [...list, blankSignal()],
          },
        },
      };
    }

    case "REMOVE_SIGNAL": {
      if (!state.notes) return state;
      const list = [...(state.notes.signalLogs[action.phaseId] ?? [])];
      list.splice(action.index, 1);
      if (!list.length) list.push(blankSignal());
      return {
        ...state,
        notes: {
          ...state.notes,
          signalLogs: { ...state.notes.signalLogs, [action.phaseId]: list },
        },
      };
    }

    case "SET_SCORE": {
      if (!state.notes) return state;
      return {
        ...state,
        notes: {
          ...state.notes,
          score: { ...state.notes.score, [action.key]: action.value },
        },
      };
    }

    case "SET_TIMER": {
      if (!state.notes) return state;
      return { ...state, notes: { ...state.notes, timer: action.timer } };
    }

    case "RESET":
      return {
        view: "intake",
        intake: defaultIntake(),
        plan: null,
        notes: null,
      };

    default:
      return state;
  }
}

export function usePlanState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  const setIntakeField = useCallback((key: keyof Intake, value: string) => {
    dispatch({ type: "SET_INTAKE_FIELD", key, value });
  }, []);

  const setNotesField = useCallback((path: string, value: unknown) => {
    dispatch({ type: "SET_NOTES_FIELD", path, value });
  }, []);

  const setView = useCallback((view: AppState["view"]) => {
    dispatch({ type: "SET_VIEW", view });
  }, []);

  const buildPlan = useCallback((plan: Plan, notes?: Notes) => {
    dispatch({ type: "BUILD_PLAN", plan, notes: notes ?? defaultNotes(plan) });
  }, []);

  const addListing = useCallback((phaseId: string) => {
    dispatch({ type: "ADD_LISTING", phaseId });
  }, []);

  const removeListing = useCallback((phaseId: string, index: number) => {
    dispatch({ type: "REMOVE_LISTING", phaseId, index });
  }, []);

  const addSignal = useCallback((phaseId: string) => {
    dispatch({ type: "ADD_SIGNAL", phaseId });
  }, []);

  const removeSignal = useCallback((phaseId: string, index: number) => {
    dispatch({ type: "REMOVE_SIGNAL", phaseId, index });
  }, []);

  const setScore = useCallback((key: ScoreKey, value: number) => {
    dispatch({ type: "SET_SCORE", key, value });
  }, []);

  const setTimer = useCallback((timer: Notes["timer"]) => {
    dispatch({ type: "SET_TIMER", timer });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);
  const patchListing = useCallback(
    (phaseId: string, index: number, patch: Partial<Listing>) => {
      dispatch({ type: "PATCH_LISTING", phaseId, index, patch });
    },
    [],
  );
  const patchSignal = useCallback(
    (phaseId: string, index: number, patch: Partial<Signal>) => {
      dispatch({ type: "PATCH_SIGNAL", phaseId, index, patch });
    },
    [],
  );

  return {
    state,
    setIntakeField,
    setNotesField,
    setView,
    buildPlan,
    addListing,
    removeListing,
    addSignal,
    removeSignal,
    setScore,
    setTimer,
    reset,
    patchListing,
    patchSignal,
  };
}
