import { author, version, repository } from "../../../package.json";
import styles from "./About.module.pcss";

const About = () => {
  return (
    <div class={styles.container}>
      <img src="/icons/icon.png" alt="icon" />
      <div>
        <h1>SD Gallery {version}</h1>
        <div>
          Created by{" "}
          <a href={author.url} target="_blank" rel="noreferrer noopener">
            {author.name}
          </a>
        </div>
        <div>
          Available on{" "}
          <a href={repository.url} target="_blank" rel="noreferrer noopener">
            Github
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
