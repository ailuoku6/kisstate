import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';
import './App.css';
import { useEffect } from 'react';

class User {
  name = 'jude';
  age = 26;
  subage = 12;

  constructor() {
    makeAutoObservable(this);
    this.age = 17;
  }

  onAgeChange() {
    console.log('agechange', this, this.age);
  }

  onNameChange() {
    console.log('namechange', this.name);
  }

  get nextAge() {
    return this.age + 1;
  }

  get nextnextAge() {
    return this.nextAge + 1;
  }

  get fullName() {
    return 'hey ' + this.name;
  }
}

const user = new User();

window.userStore = user;

const Child = () => {
  return (
    <div>
      <p>child next is {user.subage}</p>
    </div>
  );
};

function App(props: any) {
  console.log('-----------fgylog appprops', props);
  useEffect(() => {
    console.log('-----------fgylog effect');
  }, []);
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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => user.age++}>age is {user.age}</button>
        <p>next is {user.nextAge}</p>
        <p>nextnextage {user.nextnextAge}</p>
        <p>say {user.fullName}</p>
      </div>
      {true && <Child />}
    </>
  );
}

const HocApp = observer(App);

export default HocApp;
