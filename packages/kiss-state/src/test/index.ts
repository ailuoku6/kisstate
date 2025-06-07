import { ObservableClass, watchProps, computed } from '../decorators';

@ObservableClass
class User {
  name = 'gy';
  age = 26;

  constructor() {
    console.log('------------test constructor');

    this.age = 17;
  }

  @watchProps('age', 'age2')
  onAgeChange() {
    console.log('---------agechange', this.age);
  }

  @computed('age', 'name')
  get age2() {
    return this.age + 1;
  }
}

const user = new User();

user.age = 18;
