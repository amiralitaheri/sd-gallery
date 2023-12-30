import FilterInput from "./FilterInput";
import ThumbnailImageBrowser from "./ThumbnailImageBrowser";
import { cn } from "../utils";
import styles from "./ImageBrowser.module.pcss";
import { viewType } from "../states/viewTypeSignal";
import TableImageBrowser from "./TableImageBrowser";

const ImageBrowser = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <FilterInput class={styles.filter} />
      {viewType() === "thumbnail" && <ThumbnailImageBrowser />}
      {viewType() === "table" && <TableImageBrowser />}
    </div>
  );
};

export default ImageBrowser;
