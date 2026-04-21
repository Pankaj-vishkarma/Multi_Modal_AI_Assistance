import * as React from "react";
import { actionTypes, reducer } from "../components/ui/use-toast";

const listeners = [];

let memoryState = { toasts: [] };

// Better ID generator
function generateId() {
  return crypto.randomUUID();
}

// Dispatch function
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// ================= TOAST FUNCTION =================

export function toast(props) {
  const action_id = generateId();

  const update = (newProps) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...newProps, id: action_id },
    });

  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: action_id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id: action_id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto remove after delay (better UX)
  setTimeout(() => {
    dismiss();
  }, 4000);

  return {
    id: action_id,
    dismiss,
    update,
  };
}

// ================= CUSTOM HELPERS =================

// Success toast
export const showSuccessToast = (message) => {
  toast({
    title: "Success",
    description: message,
  });
};

// Error toast
export const showErrorToast = (message) => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

// ================= HOOK =================

export function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []); // FIXED (no re-register)

  return {
    ...state,
    toast,
    dismiss: (toastId) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}