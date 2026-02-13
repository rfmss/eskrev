# eskrev

![Human-written](https://img.shields.io/badge/Human--written-.skr-2B2F36)

**Written here. Verifiable by anyone.**

.skr is an offline, portable, non-trackable editor built for human writing in the age of AI.

Texts exported as `.skr` include a technical record of the human writing process.

Text is produced exclusively through human typing.
The system records the writing process and generates a verifiable capsule (.skr).

## What is a .skr file

A `.skr` file contains:
- full text
- writing process metadata
- cryptographic hash
- verifiable technical evidence

It can be checked using **.skr Verify**.

## .skr Verify

.skr Verify checks whether a text corresponds to a real human writing process.

It is not AI detection.
It is not stylistic analysis.
It is technical verification.

👉 https://tot.undo.it/verify

## Philosophy

.skr does not claim legal authorship.
It provides technical evidence.

Interpretation remains human.

## Tests

To validate copy inventory:

```bash
python3 tests/check_copy_inventory.py
```

To validate the UIX technical budget (size/lines/inline styles/inline handlers/duplicate IDs):

```bash
python3 tests/check_uix_budget.py
```

To validate DOM wiring (IDs used in JS vs IDs declared in HTML):

```bash
python3 tests/check_dom_wiring.py
```

To validate i18n key collisions (duplicate keys per language):

```bash
python3 tests/check_lang_duplicates.py
```

To validate i18n schema consistency (same keys across all languages):

```bash
python3 tests/check_lang_schema.py
```

To validate consistency between `languages[]` and language blocks in `lang.js`:

```bash
python3 tests/check_lang_codes.py
```

To run the suite with `pytest` (when dependency installation is available):

```bash
make venv
make test
```
