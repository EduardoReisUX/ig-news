import styles from "./styles.module.scss";

interface SubscribeButton {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButton) {
  return (
    <button
      type="button"
      className={styles.subscribeButton}
      // onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
}
