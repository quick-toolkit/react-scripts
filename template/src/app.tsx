import { useMemo, useState } from 'react';
import { transformer } from './utils';
import { LoginVo } from './model/login-vo';
import { Button } from 'antd';

console.log(process.env.PUBLIC_URL);

export function App() {
  const [state, setState] = useState(false);
  const loginVo = useMemo(
    () =>
      transformer.transform(LoginVo, {
        username: '123',
        password: '222',
      }),
    []
  );
  console.log(loginVo);

  return (
    <div className="app">
      <div>{String(state)}</div>
      <Button onClick={() => setState(!state)}>修改</Button>
    </div>
  );
}
