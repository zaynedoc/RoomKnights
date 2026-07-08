1
James Adams, Agustin Berastegui, Zayne Dockery, Joshua Laird, Kaden Tyrkala, David Wilson,
Aaron Zimmer (Group 12)
Professor Edward Amoruso
CAP 3104
June 24th, 2026
Requirements Analysis

2
Personas & Scenarios
Persona 1: Jane Human
? Background
? 21-year-old biology student
? Lives with 3 roommates
? Full time student and part-time worker
? Goals
? Keep shared space clean
? Ensure chores are fairly distributed
? Frustrations
? Others donÆt contribute equally
? Group chat reminders get ignored
? Ends up doing most chores
? Must repeatedly buy shared supplies
ôI find that basic respectàhas been lostàvery frustrating to clean up someone
else's mess.ö
ôTexting my roommatesàgets forgotten again.ö
Scenario
Jane notices the trash overflowing again and realizes she has taken it out three times this week.
She opens a roommate management app that shows each person's assigned tasks and
completion status. The system highlights that two roommates have missed their responsibilities.
She sends a structured reminder through the app, which requires acknowledgment and tracks
accountability.
The same app alerts Jane that shared supplies like trash bags are running low and
automatically assigns purchasing responsibility to a roommate who hasnÆt contributed recently,
reducing JaneÆs burden.

3
Persona 2: John Computer
? Background
? 20-year-old full-time engineering student
? Lives in a 4 bedroom apartment with 3 roommates
? Goals
? Complete chores on time without conflict
? Avoid being perceived as lazy
? Keep shared living spaces clean and organized
? Frustrations
? Forgets assigned tasks
? Lack of accountability system
? Shared spaces are messy due to lack of communication
? Busy schedule interferes with consistency
ôNeglect or forgetfulnessö causes missed tasks
ôReminding themàleads to them doing their taskö
Scenario
John receives a notification reminding him itÆs his turn to vacuum. The app shows a clear
deadline and a simple checklist. He completes the task and marks it done. The system updates
the shared dashboard so roommates can see progress.
Because reminders are persistent and visible, John avoids forgetting responsibilities and
prevents tension with roommates. This creates a scenario where John completes his chores
and avoids getting his roommates angry.

4
Persona 3: Alex Chen
? Background
? 21-year-old psychology major
? Full-time worker
? Uses calendars for organization
? Goals
? Maintain organized communication
? Keep chores consistent despite busy schedule
? Frustrations
? Systems break during busy weeks
? Task tracking becomes inconsistent
? Grocery cost splitting is unclear
ôBusy weeksàlead to forgetting and piling tasksö
ôGrocery shoppingàcan seem unfair and inconsistent.ö
Scenario
Alex checks the shared app calendar, which automatically syncs with her schedule. It shows
upcoming chores and grocery responsibilities. The app calculates shared expenses and evenly
distributes costs between roommates.
During finals week, automated reminders and reassignments prevent task buildup, keeping the
household running smoothly.

5
Functional / Non-Functional Requirements

| ID  | Type  | Description  | Rationale/  | Fit Criterion  |
| --- | ----- | ------------ | ----------- | -------------- |
Source
1  Functional  The system allows users to  Participants  User report
|     |     | pick up chores from a  | expressed how one    | once a chore       |
| --- | --- | ---------------------- | -------------------- | ------------------ |
|     |     | shared list.           | person does all the  | has been           |
|     |     |                        | chores from simple   | picked up it will  |
|     |     |                        | lack of              | disappear from     |
|     |     |                        | communication and    | the list.          |
the willingness to
share chores
2  Functional  The system sends push  Participants  Users report
|     |     | notifications to users of  | express frustrations  | receiving         |
| --- | --- | -------------------------- | --------------------- | ----------------- |
|     |     | when a chore to assigned   | in inconsistencies    | notifications     |
|     |     | to them with a due date    | with personal         | prior to a chore  |
|     |     |                            | reminders             | before its        |
posted due date
3  Functional  The system enables chores  Some participants  Users report
|     |     | to be automatically         | prefer specific    | that they have   |
| --- | --- | --------------------------- | ------------------ | ---------------- |
|     |     | assigned to users based on  | tasks/chore types  | been             |
|     |     | listed chore                | and specific       | auto-assigned a  |
|     |     | preference/previous         | assignments to     | chore based on   |
|     |     | assignment.                 | them may be        | their            |
|     |     |                             | preferred.         | preference/prev  |
ious
assignment.
4  Functional  The system will send out  Lack of supplies  90% of users
|     |     | reminders to purchase  | can lead to chores  | will receive and  |
| --- | --- | ---------------------- | ------------------- | ----------------- |
|     |     | supplies.              | not being           | view reminders    |
completed
5  Functional  The system assigns shared  Participants donÆt  Cost value
|     |     | item purchases (cleaning    | want unequal          | among linked   |
| --- | --- | --------------------------- | --------------------- | -------------- |
|     |     | supplies, groceries, etc.)  | distribution of cost  | users vary by  |
|     |     |                             | responsibilities      | less than 30%  |
6  Functional  System Push notifications  User might not want  User reported
|     |     | can be toggled so the user    | notifications and or  | ôbusy weeksö  |
| --- | --- | ----------------------------- | --------------------- | ------------- |
|     |     | gets the choice if they want  | need them off due     | meaning they  |
|     |     | to be notified.               | to individual         | could either  |
|     |     |                               | reasons               | need          |
notifications on
or perhaps off.
7  Functional   An optional ôgroupö leader  Having a optional  Users have
|     |     | can be assigned so that      | group leader could  | reported         |
| --- | --- | ---------------------------- | ------------------- | ---------------- |
|     |     | they can ensure that others  | help give some      | needing extra    |
|     |     | are getting the chores       | individuals extra   | accountability   |
|     |     | done.                        | reminders.          |                  |

6
8  Non-Functional  The system should be able  Participants donÆt  The program
| to load the dashboard in a  | want to waste time  | should load  |
| --------------------------- | ------------------- | ------------ |
| timely manner.              | waiting for the     | within 3     |
|                             | program to load.    | seconds.     |
9  Non-Functional  The system should be  Participants are  Surveying users
| aesthetically pleasing and  | more likely to use     | to rate their   |
| --------------------------- | ---------------------- | --------------- |
| easy to use.                | the app if it is more  | overall         |
|                             | enjoyable.             | perceptions of  |
the app. The
average score
should be >=
5.5/7
10  Non-Functional  Colorblind accessibility  Some participants  90% of users
| options, changes color of   | express a lack of       | should be able    |
| --------------------------- | ----------------------- | ----------------- |
| user interfaces throughout  | accessibility options   | to identify what  |
| the app, depending on the   | making it difficult to  | a color means     |
| userÆs options.             | functionally use        | when asked.       |
some mobile apps.

Requirements Critique
Critique 1
Before: ôThe app should be easy to use.ö
After: Average usability ratings shall be ? 5.5 on a 7-point Likert scale.
Explanation
Converted subjective ôeasyö into measurable user testing data. The refined statement is defined
with a standardized measurement to create objectivity via a testable benchmark metric. This
satisfies the Volere ShellÆs demand for Fit Criterion with verifiable data.
Critique 2
Before: ôThe app should send reminders quickly.ö
After: Notifications shall be delivered within 2 seconds of trigger events.
Explanation
Replaced vague ôquicklyö with precise timing requirement. Measured through time instead of
ôvibeö.

7
Traceability Table

| Requirement  | Persona   | Scenario Link         |
| ------------ | --------- | --------------------- |
| 1            | John and  | Busy schedule breaks  |
|              | Alex      | the agreed            |
responsibilities
| 2   | All  | Reminders are needed  |
| --- | ---- | --------------------- |
to keep responsibilities
reminded
| 3   | Alex  | Lack of an accountable  |
| --- | ----- | ----------------------- |
system
| 4   | Jane  | Reminders for when  |
| --- | ----- | ------------------- |
shared supplies are
running low prevent
them from running out
| 5   | Jane and  | Grocery/Shared supply  |
| --- | --------- | ---------------------- |
|     | Alex      | cost responsibilities  |
need to be assigned
and distributed fairly
| 6   | Alex  | Busy weeks can have  |
| --- | ----- | -------------------- |
him behind on chores
but having reminders
on could help.
| 7   | Jane and  | Both users reported      |
| --- | --------- | ------------------------ |
|     | John      | either needing personal  |
accountability or
worried about others
not contributing.
| 8   | All  | Users want a fast  |
| --- | ---- | ------------------ |
loading time.
| 9   | All  | Users want a clean and  |
| --- | ---- | ----------------------- |
easy to use interface.
| 10  | John  | Users may have  |
| --- | ----- | --------------- |
disabilities that would
interfere with
recognition of task
completion.
