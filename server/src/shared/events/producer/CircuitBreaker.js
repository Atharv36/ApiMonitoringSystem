export const CircuitState = Object.freeze({
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
});


export class CircuitBreaker {
    constructor(opts = {}) {
        this.failureThreshold = opts.failureThreshold ?? 5;
        this.coolDownMs = opts.coolDownMs ?? 30_000;
        this.halfOpenMaxAttempts = opts.halfOpenMaxAttempts ?? 3;
        this.logger = opts.logger ?? console;

        this._state = CircuitState.CLOSED;
        this._failures = 0;
        this._lastFailureTime = 0;
        this._halfOpenAttempts = 0;
        this._halfOpenSuccess = 0;
    }

    _cooldownElapsed() {
        return Date.now() - this._lastFailureTime >= this.coolDownMs;
    }

    _transitionTo(newState) {
        const prev = this._state;
        this._state = newState;

        this.logger.info(
            `[CircuitBreaker] ${prev} => ${newState}`
        );

        if (newState === CircuitState.HALF_OPEN) {
            this._halfOpenAttempts = 0;
            this._halfOpenSuccess = 0;
        }
    }

    _openCircuit() {
        this._lastFailureTime = Date.now();

        this._transitionTo(CircuitState.OPEN);

        this.logger.error('[CircuitBreaker] OPEN', {
            failures: this._failures,
            coolDownMs: this.coolDownMs
        });
    }

    _reset() {
        const prev = this._state;

        this._state = CircuitState.CLOSED;
        this._failures = 0;
        this._halfOpenAttempts = 0;
        this._halfOpenSuccess = 0;

        this.logger.info(
            `[CircuitBreaker] ${prev} => CLOSED`
        );
    }

    get state() {
        if (
            this._state === CircuitState.OPEN &&
            this._cooldownElapsed()
        ) {
            this._transitionTo(CircuitState.HALF_OPEN);
        }

        return this._state;
    }

    allowRequest() {
        const current = this.state;

        if (current === CircuitState.CLOSED) {
            return true;
        }

        if (current === CircuitState.HALF_OPEN) {
            if (
                this._halfOpenAttempts <
                this.halfOpenMaxAttempts
            ) {
                this._halfOpenAttempts++;

                this.logger.info(
                    `[CircuitBreaker] HALF_OPEN attempt ${this._halfOpenAttempts}/${this.halfOpenMaxAttempts}`
                );

                return true;
            }

            this.logger.warn(
                '[CircuitBreaker] HALF_OPEN attempts exhausted'
            );

            return false;
        }

        this.logger.warn(
            '[CircuitBreaker] request rejected - circuit OPEN'
        );

        return false;
    }

    onSuccess() {
        if (this._state === CircuitState.HALF_OPEN) {
            this._halfOpenSuccess++;

            this.logger.info(
                `[CircuitBreaker] HALF_OPEN success ${this._halfOpenSuccess}/${this.halfOpenMaxAttempts}`
            );

            if (
                this._halfOpenSuccess >=
                this.halfOpenMaxAttempts
            ) {
                this._reset();
            }

            return;
        }

        if (this._failures > 0) {
            this.logger.info(
                '[CircuitBreaker] failure counter reset after success'
            );

            this._failures = 0;
        }
    }

    onFailure() {
        if (this._state === CircuitState.HALF_OPEN) {
            this.logger.warn(
                '[CircuitBreaker] HALF_OPEN failed, reopening circuit'
            );

            this._openCircuit();
            return;
        }

        this._failures++;
        this._lastFailureTime = Date.now();

        this.logger.error(
            `[CircuitBreaker] failure count: ${this._failures}/${this.failureThreshold}`
        );

        if (this._failures >= this.failureThreshold) {
            this._openCircuit();
        }
    }

    snapshot() {
        return {
            state: this.state,
            failures: this._failures,
            lastFailureTime: this._lastFailureTime,
            halfOpenAttempts: this._halfOpenAttempts,
            halfOpenSuccess: this._halfOpenSuccess,
        };
    }
}