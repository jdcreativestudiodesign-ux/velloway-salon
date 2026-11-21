#!/usr/bin/env bash
# Negative controls: plants one deliberate bug at a time in a scratch copy
# and checks that the test suite fails. A planted bug that the tests miss
# means a rule is not really tested.
#
# Usage: ./negative-controls.sh   (run from the project folder after npm ci)

set -u
cd "$(dirname "$0")"
ROOT="$(pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

caught=0
missed=0

# plant <description> <file> <perl substitution>
# plant_bytes <description> <file> <node code>   (edits a binary file; the code gets `b`, a Buffer)
plant() {
  apply_and_test "$1" "$2" perl "$3"
}

plant_bytes() {
  apply_and_test "$1" "$2" node "$3"
}

apply_and_test() {
  local description="$1" file="$2" tool="$3" change="$4"
  rm -rf "$WORK/copy"
  mkdir -p "$WORK/copy"
  tar --exclude=node_modules --exclude=.next -cf - . | tar -xf - -C "$WORK/copy"
  ln -s "$ROOT/node_modules" "$WORK/copy/node_modules"

  local before after
  before="$(cksum < "$WORK/copy/$file")"
  if [ "$tool" = perl ]; then
    perl -0pi -e "$change" "$WORK/copy/$file"
  else
    node -e "const fs=require('fs');const f=process.argv[1];let b=fs.readFileSync(f);$change;fs.writeFileSync(f,b);" "$WORK/copy/$file"
  fi
  after="$(cksum < "$WORK/copy/$file")"
  if [ "$before" = "$after" ]; then
    echo "SETUP ERROR: the bug for \"$description\" did not apply to $file"
    missed=$((missed + 1))
    return
  fi

  if (cd "$WORK/copy" && npx vitest run > "$WORK/log.txt" 2>&1); then
    echo "MISSED: $description"
    missed=$((missed + 1))
  else
    echo "caught: $description"
    caught=$((caught + 1))
  fi
}

plant "salon open on Sundays and Mondays" \
  src/lib/salon.ts 's/OPEN_DAYS = \[2, 3, 4, 5, 6\]/OPEN_DAYS = [0, 1, 2, 3, 4, 5, 6]/'
plant "booking window off by one day" \
  src/lib/booking.ts 's/daysAhead > SALON\.bookingWindowDays/daysAhead >= SALON.bookingWindowDays/'
plant "yesterday accepted as a booking day" \
  src/lib/booking.ts 's/daysAhead < 0/daysAhead < -1/'
plant "impossible dates such as 30 February accepted" \
  src/lib/booking.ts 's/\) \{\n    return null;\n  \}\n  return time;/) {\n  }\n  return time;/'
plant "\"today\" taken from the server clock (UTC), not the salon" \
  src/lib/booking.ts 's/timeZone,\n    year/timeZone: "UTC",\n    year/'
plant "Saturday evening slots allowed" \
  src/lib/booking.ts 's/=== SATURDAY/=== 99/'
plant "badly formed emails accepted" \
  src/lib/booking.ts 's/!EMAIL_PATTERN\.test\(email\)/false/'
plant "spam trap ignored" \
  src/lib/booking.ts 's/input\.website\.trim\(\) !== ""/false/'
plant "typed values lost after an error" \
  src/app/actions.ts 's/name: input\.name,\n/name: "",\n/'
plant "errors no longer linked to their fields for screen readers" \
  src/components/BookingForm.tsx 's/"aria-describedby": `\$\{field\}-error`//'
plant "demo label removed from the page" \
  src/app/page.tsx 's/Portfolio sample: an invented business/A hair salon/'

plant_bytes "one byte of the hero photo changed" \
  public/images/salon-hero.jpg 'b[b.length-100]^=0xff'
plant_bytes "EXIF metadata added back into the hero photo" \
  public/images/salon-hero.jpg 'b=Buffer.concat([b.subarray(0,2),Buffer.from([0xff,0xe1,0,8,0x45,0x78,0x69,0x66,0,0]),b.subarray(2)])'
plant "hero photo description emptied" \
  src/lib/photos.ts 's/alt: "A bright salon[^"]*"/alt: ""/'

echo
echo "$caught caught, $missed missed"
[ "$missed" -eq 0 ]
