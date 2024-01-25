import styles from "./Footer.module.pcss";
import { cn } from "../utils";
import { imagesStoreState } from "../states/imagesStore";
import { ClosedEyeIcon, EyeIcon, TableIcon, ThumbnailsIcon } from "./icons";
import { setViewType, viewType } from "../states/viewTypeSignal";
import { showHidden, toggleShowHidden } from "../states/showHiddenSignal";

const Footer = (props) => {
  const imagesCount = () =>
    showHidden()
      ? imagesStoreState.images.length
      : imagesStoreState.nonHiddenImages.length;
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        {`${imagesCount()} item${imagesCount() > 1 ? "s" : ""}`} |
        <button onClick={toggleShowHidden}>
          {showHidden() ? <EyeIcon /> : <ClosedEyeIcon />}
        </button>
      </div>
      <div>
        <button
          class={cn(viewType() === "table" && styles.selected)}
          onClick={() => setViewType("table")}
        >
          <TableIcon />
        </button>
        <button
          class={cn(viewType() === "thumbnail" && styles.selected)}
          onClick={() => setViewType("thumbnail")}
        >
          <ThumbnailsIcon />
        </button>
      </div>
    </div>
  );
};

export default Footer;
