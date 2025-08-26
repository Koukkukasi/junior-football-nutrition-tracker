#!/bin/bash

# Add the position conversion function after the imports
sed -i '3a\n// Convert position string to enum value\nconst convertPositionToEnum = (positionString: string | null | undefined): string | null => {\n  if (!positionString) return null;\n  \n  const positionMap: Record<string, string> = {\n    \"Goalkeeper\": \"GOALKEEPER\",\n    \"Defender\": \"DEFENDER\", \n    \"Midfielder\": \"MIDFIELDER\",\n    \"Forward\": \"FORWARD\"\n  };\n  \n  return positionMap[positionString] || null;\n};\n' src/controllers/auth.controller.ts

# Fix the position assignments
sed -i 's/position,/position: convertPositionToEnum(position),/g' src/controllers/auth.controller.ts
sed -i 's/position: position || null,/position: convertPositionToEnum(position) || null,/g' src/controllers/auth.controller.ts
sed -i 's/position: position || user\.position,/position: convertPositionToEnum(position) || user.position,/g' src/controllers/auth.controller.ts
sed -i 's/{ position },/{ position: convertPositionToEnum(position) },/g' src/controllers/auth.controller.ts

echo "✅ Fixed auth controller position conversion"
