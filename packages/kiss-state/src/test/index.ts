import { ObservableClass, watchProps } from '../decorators';

@ObservableClass
class User {
  name = 'gy';
  age = 26;

  constructor() {
    console.log('------------test constructor');

    this.age = 17;
  }

  @watchProps<User>('age', 'name')
  onAgeChange() {
    console.log('---------agechange', this.age);
  }
}

const user = new User();

user.age = 18;
