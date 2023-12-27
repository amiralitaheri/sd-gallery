import styles from "./Footer.module.pcss";
import { cn } from "../utils";
import { imagesStoreState } from "../states/imagesStore";
import { TableIcon, ThumbnailsIcon } from "./icons";
import { setViewType, viewType } from "../states/viewTypeSignal";

const Footer = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        {`${imagesStoreState.images.length} item${
          imagesStoreState.images.length > 1 ? "s" : ""
        }`}
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
