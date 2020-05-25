import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
} from 'react';
import './styles.css';
import api from './services/api';

interface GetCategories {
  name: string;
}

interface IUserCategory {
  category: {
    name: string;
  };
}

type IUser = {
  name: string;
  user_category: IUserCategory[];
}[];

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<GetCategories[]>([]);
  const [findCategories, setFindCategories] = useState<GetCategories[]>([]);
  const refCategory = useRef<HTMLInputElement>(null);
  const refName = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);

  const [users, setUsers] = useState<IUser>([]);

  const handleListCategory = useCallback(
    (saveCategory: string, charCode: number) => {
      if (charCode === 13 && saveCategory.trim() !== '') {
        const haveSave = categories.find(cat => cat === saveCategory);

        if (!haveSave) setCategories([...categories, saveCategory]);

        if (refCategory.current) refCategory.current.focus();
        setFindCategories([]);
        setCategory('');
      }
    },
    [categories],
  );

  const loadUsers = useCallback(async (): Promise<void> => {
    const user = await api.get('users');
    setUsers(user.data);
  }, []);

  const handleRemoveCategory = useCallback(
    (categoryRemove: string) => {
      setCategories(categories.filter(cat => cat !== categoryRemove));
      if (refCategory.current) refCategory.current.focus();
    },
    [categories],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (category !== '' && findCategories.length === 0) {
      setLoading(true);
      const loadCategories = async (search: string): Promise<void> => {
        const getCategories = await api.get<GetCategories[]>('categories', {
          params: {
            search,
          },
        });

        setAllCategories(getCategories.data);
      };

      loadCategories(category.trim());
      setLoading(false);
    }
  }, [category, findCategories.length]);

  useEffect(() => {
    const matchCategories = category.trim()
      ? allCategories.filter(cat => {
          const haveInCategories = categories.find(
            getCategory => getCategory === cat.name,
          );

          return (
            cat.name.toLowerCase().includes(category.toLowerCase().trim()) &&
            !haveInCategories
          );
        })
      : [];

    setFindCategories(matchCategories);
  }, [allCategories, categories, category]);

  const handleSubmit = useCallback(async () => {
    await api.post('users', {
      name,
      categories,
    });
    setCategories([]);
    setName('');
    setCategory('');
    setFindCategories([]);
    loadUsers();
  }, [name, categories, loadUsers]);

  return (
    <div className="container">
      <h1>Skills Search</h1>
      <input
        className="input-name"
        placeholder="Your Name"
        onChange={e => setName(e.target.value)}
        value={name}
        ref={refName}
      />

      <div className="categories">
        <ul>
          {categories.map(categorySave => (
            <li key={categorySave}>
              {categorySave}
              <span
                onClick={() => handleRemoveCategory(categorySave)}
                role="presentation"
              >
                x
              </span>
            </li>
          ))}
        </ul>
        <input
          placeholder="Put your skills"
          onChange={e => setCategory(e.target.value)}
          value={category}
          ref={refCategory}
          onKeyPress={e => handleListCategory(category, e.charCode)}
        />
      </div>

      {(loading || findCategories.length > 0) && (
        <div className="content-list-category">
          <ul className="list-categories">
            {loading && <li className="list-loading">Loading...</li>}
            {findCategories.map(({ name: nameCategory }) => (
              <li
                key={nameCategory}
                onClick={() => handleListCategory(nameCategory, 13)}
                role="presentation"
              >
                {nameCategory}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" onClick={handleSubmit}>
        SUBSCRIBE
      </button>

      <h1>List Users</h1>

      <div className="list-users">
        {users.map((user, index) => (
          <Fragment key={user.name + index.toString()}>
            <h2>{user.name}</h2>
            <ul>
              {user.user_category.map(({ category: { name: catName } }, i) => (
                <li key={i.toString() + catName}>{catName}</li>
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default App;
