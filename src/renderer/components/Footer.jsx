import styles from "./Footer.module.pcss";
import { cn } from "../utils";
import { imagesStoreState } from "../states/imagesStore";
const Footer = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        {`${imagesStoreState.images.length} item${
          imagesStoreState.images.length > 1 ? "s" : ""
        }`}
      </div>
      <div>browser layout selector</div>
    </div>
  );
};

export default Footer;
