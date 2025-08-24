-- Update Markus's profile to Admin role and adult age
UPDATE "User" 
SET 
    role = 'ADMIN',
    age = 25,
    "ageGroup" = '19-25'
WHERE "clerkId" = 'user_31WS21sVk2eoGZkMe14EM8Eje1o';