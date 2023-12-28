import { StarFullIcon } from "./icons";
import styles from "./RateInput.module.pcss";
import { cn } from "../utils";
import { createEffect, createSignal, on } from "solid-js";

const RateInput = (props) => {
  const [tempRating, setTempRating] = createSignal(props.rating || 0);
  createEffect(
    on(
      () => props.rating,
      () => {
        setTempRating(props.rating || 0);
      },
    ),
  );

  return (
    <div class={styles.container}>
      <button
        class={cn(tempRating() > 0 && styles.filled)}
        onMouseEnter={() => setTempRating(1)}
        onMouseLeave={() => setTempRating(props.rating)}
        onClick={() => props.onChnage(1)}
      >
        <StarFullIcon />
      </button>
      <button
        class={cn(tempRating() > 1 && styles.filled)}
        onMouseEnter={() => setTempRating(2)}
        onMouseLeave={() => setTempRating(props.rating)}
        onClick={() => props.onChnage(2)}
      >
        <StarFullIcon />
      </button>
      <button
        class={cn(tempRating() > 2 && styles.filled)}
        onMouseEnter={() => setTempRating(3)}
        onMouseLeave={() => setTempRating(props.rating)}
        onClick={() => props.onChnage(3)}
      >
        <StarFullIcon />
      </button>
      <button
        class={cn(tempRating() > 3 && styles.filled)}
        onMouseEnter={() => setTempRating(4)}
        onMouseLeave={() => setTempRating(props.rating)}
        onClick={() => props.onChnage(4)}
      >
        <StarFullIcon />
      </button>
      <button
        class={cn(tempRating() > 4 && styles.filled)}
        onMouseEnter={() => setTempRating(5)}
        onMouseLeave={() => setTempRating(props.rating)}
        onClick={() => props.onChnage(5)}
      >
        <StarFullIcon />
      </button>
    </div>
  );
};

export default RateInput;
