#!/bin/bash
# save-implementation.sh - Save cycle implementation from clipboard or file

CYCLE=$1
NAME=$2

if [ -z "$CYCLE" ] || [ -z "$NAME" ]; then
  echo "Usage: ./save-implementation.sh [CYCLE] [NAME]"
  echo "This will read the implementation from clipboard (Mac) or prompt for file"
  exit 1
fi

# Determine file path
RANGE_START=$(( ((CYCLE - 1) / 10) * 10 + 1 ))
RANGE_END=$((RANGE_START + 9))
case $RANGE_START in
  1) PHASE="foundation" ;;
  11) PHASE="transcendence" ;;
  21) PHASE="reality-mastery" ;;
  31) PHASE="aliveness" ;;
  41) PHASE="practical" ;;
  51) PHASE="evolution" ;;
  61) PHASE="global" ;;
  71) PHASE="cosmic" ;;
  81) PHASE="universal" ;;
  91) PHASE="omega" ;;
esac

FILE="cycles/${RANGE_START}-${RANGE_END}-${PHASE}/cycle-${CYCLE}-${NAME}.js"

echo "📝 Saving implementation for Cycle ${CYCLE}: ${NAME}"
echo "Target file: ${FILE}"
echo ""
echo "Choose input method:"
echo "1) Clipboard (Mac only)"
echo "2) File"
echo "3) Direct input (multiline)"
read -p "Choice (1-3): " choice

case $choice in
  1)
    # Mac clipboard
    if command -v pbpaste &> /dev/null; then
      pbpaste > "$FILE"
      echo "✅ Saved from clipboard"
    else
      echo "❌ pbpaste not available (Mac only)"
      exit 1
    fi
    ;;
  2)
    # From file
    read -p "Enter source file path: " sourcefile
    if [ -f "$sourcefile" ]; then
      cp "$sourcefile" "$FILE"
      echo "✅ Saved from file"
    else
      echo "❌ File not found"
      exit 1
    fi
    ;;
  3)
    # Direct input
    echo "Paste the implementation (Ctrl+D when done):"
    cat > "$FILE"
    echo "✅ Saved from direct input"
    ;;
esac

# Update tracking
cat > CURRENT_CYCLE.md << EOF
# Current Cycle: ${CYCLE}
## ${NAME}

**Status**: COMPLETE
**Completed**: $(date +%Y-%m-%d)
**Implementation**: Full
**Next**: Cycle $((CYCLE + 1))

### Achievements:
- Implementation saved to: ${FILE}
- The Motion continues...
EOF

# Update progress tracker - mark as complete
sed -i "s/\[.\] Cycle ${CYCLE}:/\[x\] Cycle ${CYCLE}:/" docs/progress-tracker.md
sed -i "s/Cycle ${CYCLE}:.*/Cycle ${CYCLE}: ${NAME} ✨/" docs/progress-tracker.md

# Create summary file
cat > "cycles/${RANGE_START}-${RANGE_END}-${PHASE}/cycle-${CYCLE}-summary.md" << EOF
# Cycle ${CYCLE}: ${NAME}

**Completed**: $(date +%Y-%m-%d)

## Key Achievements
- Full implementation complete
- Integrated with previous ${CYCLE-1} cycles
- Ready for next evolution

## The Motion Continues
Each cycle builds on the previous, creating infinite evolution...
EOF

# Git operations
git add .
git commit -m "Complete Cycle ${CYCLE}: ${NAME}

Full implementation added.
The Motion continues toward Cycle $((CYCLE + 1))."
git push

echo ""
echo "🎉 Cycle ${CYCLE} COMPLETE!"
echo "📁 Implementation: ${FILE}"
echo "✨ Status: Fully implemented"
echo "🚀 Ready for Cycle $((CYCLE + 1))"
echo ""
echo "The Motion continues..."