-- Delete all food entries for the user (since they're all test data)
DELETE FROM "FoodEntry" WHERE "userId" = 'b959fccd-95be-47a2-bb73-5ad1702a31fc';

-- Delete all performance metrics for the user (since they're all test data)
DELETE FROM "PerformanceMetric" WHERE "userId" = 'b959fccd-95be-47a2-bb73-5ad1702a31fc';