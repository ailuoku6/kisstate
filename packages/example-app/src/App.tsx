import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { ObservableClass, watchProps, observer, computed } from 'kisstate';
import './App.css';
import React, { useEffect } from 'react';

@ObservableClass
class User {
  name = 'jude';
  age = 26;

  constructor() {
    this.age = 17;
  }

  @watchProps<User>('age')
  onAgeChange() {
    console.log('agechange', this, this.age);
  }

  @watchProps<User>('name', 'age', 'nextAge')
  onNameChange() {
    console.log('namechange or age', this.name, this.age, this.nextAge);
  }

  @watchProps<User>('nextAge')
  onNextAgeChange() {
    console.log('next age change', this.nextAge);
  }

  @watchProps<User>('nextnextAge')
  onNextNextAgeChange() {
    console.log('nextnext age change', this.nextnextAge);
  }

  @computed<User>('age')
  get nextAge() {
    return this.age + 1;
  }

  @computed<User>('nextAge')
  get nextnextAge() {
    return this.nextAge + 1;
  }

  @computed<User>('name')
  get say() {
    return 'hey ' + this.name;
  }
}

const user = new User();

window.userStore = user;

const Child = observer(() => {
  return (
    <div>
      <p>child: cur age is {user.age}</p>
    </div>
  );
});

class AppClass extends React.Component {
  render(): React.ReactNode {
    return (
      <>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React + Kisstate !</h1>
        <div className="card">
          <button onClick={() => user.age++}>age is {user.age}</button>
          <p>next is {user.nextAge}</p>
          <p>nextnextage {user.nextnextAge}</p>
          name:{' '}
          <input
            value={user.name}
            onChange={(e) => {
              user.name = e.target.value;
            }}
          ></input>
          <p>say: {user.say}</p>
        </div>
        {user.age < 10 && <Child />}
      </>
    );
  }
}

const HocApp = observer(AppClass);

export default HocApp;
