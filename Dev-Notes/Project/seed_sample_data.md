# Seed Sample Data -- Developer Notes

This command populates the database with **sample contest data** for
development and testing.

## What It Creates

-   3 Users
-   5 Problems
-   20 TestCases
-   1 Contest
-   Contest--Problem mappings
-   Contest registrations
-   Sample submissions
-   Leaderboard entries

------------------------------------------------------------------------

## Command Location

Create inside the **contest app**:

    contest/
    ├── management/
    │   ├── __init__.py
    │   └── commands/
    │       ├── __init__.py
    │       └── seed_sample_data.py

------------------------------------------------------------------------

## Run Command

``` bash
python manage.py seed_sample_data
```

------------------------------------------------------------------------

## Data Creation Order

To avoid foreign key issues, objects are created in this order:

    User
    → Problem
    → TestCase
    → Contest
    → ContestProblem
    → ContestRegistration
    → Submission
    → Leaderboard

------------------------------------------------------------------------

## Default Test Users

    student1@example.com / Test@1234
    student2@example.com / Test@1234
    student3@example.com / Test@1234

------------------------------------------------------------------------

## Contest Details

    Contest Name: Sample Coding Contest
    Duration: 2 Hours
    Problems: 5
    Participants: 3

------------------------------------------------------------------------

## Problems Added

1.  Two Sum
2.  Reverse String
3.  Palindrome Check
4.  Factorial Number
5.  Maximum in Array

Each problem includes **4 testcases**.

    5 Problems × 4 Testcases = 20 Testcases

------------------------------------------------------------------------

## Example Leaderboard

  Rank   User       Score   Solved   Penalty
  ------ ---------- ------- -------- ---------
  1      student3   250     2        15
  2      student1   200     2        20
  3      student2   120     1        35

------------------------------------------------------------------------

## Why Use This

Benefits:

-   Quickly populate database
-   Test contest editor
-   Test submissions
-   Test leaderboard
-   Avoid manual admin data entry

------------------------------------------------------------------------

## Typical Development Flow

``` bash
git clone repo
python manage.py migrate
python manage.py seed_sample_data
python manage.py runserver
```

Frontend:

    http://localhost:5173/contests

------------------------------------------------------------------------

## Future Improvements

Possible enhancements:

    python manage.py seed_sample_data --reset
    python manage.py seed_sample_data --users 50
    python manage.py seed_sample_data --problems 20

Useful for generating **large datasets for load testing**.
