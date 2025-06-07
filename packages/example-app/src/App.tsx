import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

import { ObservableClass, watchProps, observer, computed } from 'kisstate';
import './App.css';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

@ObservableClass
class User {
  name = 'jude';
  age = 26;
  obj = {};
  testStr = 'test';
  testNum = 1;

  constructor() {
    this.age = 17;
  }

  fun() {

  }

  @watchProps('age')
  onAgeChange() {
    console.log('agechange', this, this.age);
  }

  @watchProps('name', 'age', 'nextAge')
  onNameChange() {
    console.log('namechange or age', this.name, this.age, this.nextAge);
  }

  @watchProps('nextAge')
  onNextAgeChange() {
    console.log('next age change', this.nextAge);
  }

  @watchProps('nextnextAge')
  onNextNextAgeChange() {
    console.log('nextnext age change', this.nextnextAge);
  }

  @computed('age')
  get nextAge() {
    return this.age + 1;
  }

  @computed('nextAge')
  get nextnextAge() {
    return this.nextAge + 1;
  }

  @computed('name')
  get say() {
    return 'hey ' + this.name;
  }
}

const user = new User();

window.userStore = user;

const Child = observer(
  forwardRef<{ childFun: () => void }>((_props, ref) => {
    const [num, setNum] = useState(1);
    useEffect(() => {
      console.log('--------------childFun1', user.testNum);
    }, [user.testNum]);
    useImperativeHandle(
      ref,
      () => ({
        childFun: () => {
          console.log('-----------childFun call', num);
          setNum((n) => n + 1);
        },
      }),
      [num],
    );
    return (
      <div>
        <p>child: cur age is {user.age}</p>
        <p>child: num is {num}</p>
        <p>child: testStr is {user.testStr}</p>
      </div>
    );
  }),
);

const FunChild = observer(() => {
  useEffect(() => {
    console.log('----------FunChild', user.testNum);
  }, [user.testNum]);
  return <div>FunChild</div>;
});

class ClassChild extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 1,
    };
  }

  classChildFun() {
    console.log('-----------classChildFun call', this.state);
    this.setState({ num: this.state.num + 1 });
  }

  render(): React.ReactNode {
    return (
      <div>
        ClassChild: num is {this.state.num}
        <p>classChild: cur age is {user.age}</p>
        <p>classChild: testStr is {user.testStr}</p>
      </div>
    );
  }
}

const ClassChild2 = observer(ClassChild);

class AppClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 1,
    };
    this.childRef = React.createRef<typeof Child>();
    this.classChildRef = React.createRef();
  }

  componentDidMount(): void {
    console.log('----------childRef', this.childRef);
    console.log('----------classChildRef', this.classChildRef);
    this.childRef.current?.childFun();
    this.classChildRef.current?.classChildFun();
  }

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
          <button
            onClick={() => {
              this.setState({ num: this.state.num + 1 });
            }}
          >
            num is {this.state.num}
          </button>
          <p>next age is {user.nextAge}</p>
          <p>next next age is {user.nextnextAge}</p>
          name:{' '}
          <input
            value={user.name}
            onChange={(e) => {
              user.name = e.target.value;
            }}
          ></input>
          <p>say: {user.say}</p>
        </div>
        <button
          onClick={() => {
            this.childRef.current?.childFun();
          }}
        >
          child click
        </button>
        <Child ref={this.childRef} />
        <button
          onClick={() => {
            this.classChildRef.current?.classChildFun();
          }}
        >
          classChild click
        </button>
        <ClassChild2 ref={this.classChildRef} />

        <FunChild />
      </>
    );
  }
}

const HocApp = observer(AppClass);

export default HocApp;
