// Legacy auxiliary module — kept so any explicit import of the
// emulator-connection step still works. The real connection lives in
// [./firebase.ts](./firebase.ts); this module is a no-op now and exists
// only to avoid breaking ad-hoc developer imports.
import './firebase';

export default {};
