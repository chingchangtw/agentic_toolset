## 1. Build Phase Registry Updates

- [x] 1.1 Add `/code-review` as `always` check in `src/skills/lifecycle-router/modules/registry/registry-build.md`: after the change, the Build phase registry table contains a row with id=`code-review`, type=`always`, trigger=`each change`, skill/cmd=`gstack:/code-review`, block=`-`. Verification: open the file and confirm the row exists with correct column values; the `/code-review is registered in the Build phase registry` requirement from the spec is satisfied.

- [x] 1.2 Add `/simplify` as `rec` check in `src/skills/lifecycle-router/modules/registry/registry-build.md`: after the change, the Build phase registry table contains a row with id=`simplify`, type=`rec`, trigger=`after logical change unit`, skill/cmd=`gstack:/simplify`, block=`-`. Verification: open the file and confirm the row exists; the `/simplify is registered in the Build phase registry` requirement from the spec is satisfied.

## 2. Review Phase Registry Updates

- [x] 2.1 Add `/code-review` as `rec` check in `src/skills/lifecycle-router/modules/registry/registry-review.md`: after the change, the Review phase registry table contains a row with id=`code-review-deep`, type=`rec`, trigger=`deeper review before exit`, skill/cmd=`gstack:/code-review`, block=`-`. Verification: open the file and confirm the row exists; the `/code-review is registered in the Review phase registry` requirement from the spec is satisfied.

- [x] 2.2 Add `/security-review` as `gate` in `src/skills/lifecycle-router/modules/registry/registry-review.md`: after the change, the Review phase registry table contains a row with id=`security-review`, type=`gate`, trigger=`before leave review`, skill/cmd=`gstack:/security-review`, block=`yes`. Verification: open the file and confirm the row exists with block=`yes`; the `/security-review is registered in the Review phase registry as a gate` requirement from the spec is satisfied, and the router will block Review phase exit until this gate is passed or signed_off.
