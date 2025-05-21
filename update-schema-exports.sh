#!/bin/bash

# Update all schema files to have consistent schema and type exports

# Process files with multiple tables first
files_with_multiple_tables=(
  "packages/db/schema/verification-tokens.ts"
  "packages/db/schema/billing.ts"
  "packages/db/schema/data-rooms.ts"
)

# List of files to update
all_files=$(find packages/db/schema -type f -name "*.ts" -not -name "index.ts" -not -name "enums.ts" -not -name "table.ts" -not -name "relations.ts")

# Process remaining files
for file in $all_files; do
  # Skip already processed files with multiple tables
  if [[ " ${files_with_multiple_tables[@]} " =~ " $file " ]]; then
    echo "Skipping $file (already processed)"
    continue
  fi
  
  # Get the table name from the file
  table_name=$(grep -o "export const [a-zA-Z0-9_]* = createTable" "$file" | head -1 | sed -E 's/export const ([a-zA-Z0-9_]*) = createTable.*/\1/')
  
  if [ -z "$table_name" ]; then
    echo "No table found in $file, skipping"
    continue
  fi
  
  # Convert to PascalCase for type name
  type_name=$(echo "$table_name" | sed -E 's/^([a-z])/\U\1/g')
  
  # Find current schema export line and replace it
  if grep -q "export const.*createSelectSchema" "$file"; then
    # Replace the existing schema export with the standardized format
    sed -i '' -E "s/export const ([a-zA-Z0-9_]*)SelectSchema = createSelectSchema\($table_name\);/export const ${type_name}Schema = createSelectSchema($table_name);\nexport type $type_name = typeof $table_name.\$inferSelect;/g" "$file"
  else
    # Add the schema export if it doesn't exist
    echo "export const ${type_name}Schema = createSelectSchema($table_name);" >> "$file"
    echo "export type $type_name = typeof $table_name.\$inferSelect;" >> "$file"
  fi
  
  echo "Updated $file"
done

echo "All schema files updated!" 