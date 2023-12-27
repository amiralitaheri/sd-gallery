import FilterInput from "./FilterInput";
import ThumbnailImageBrowser from "./ThumbnailImageBrowser";
import { cn } from "../utils";
import styles from "./ImageBrowser.module.pcss";

const ImageBrowser = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <FilterInput />
      <ThumbnailImageBrowser />
    </div>
  );
};

export default ImageBrowser;
