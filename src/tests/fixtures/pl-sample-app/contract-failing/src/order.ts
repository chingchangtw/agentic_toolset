import { requires } from '../../../../../utils/contracts';

const hours = 2;
const capacity = 1;
requires(hours <= capacity, 'TIMESHEET-HOURS-CAPACITY', 'hours exceed capacity');
