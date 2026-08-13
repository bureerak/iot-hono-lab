CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"student_id" varchar(50) NOT NULL UNIQUE,
	"date_of_birth" date NOT NULL,
	"gender" text NOT NULL
);
