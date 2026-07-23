import { cn } from "../../lib/utils";
import styles from "../../styles/modules/ui/Select.module.scss";

export function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(styles.select, className)}
            {...props}
        >
            {children}
        </select>
    );
}
