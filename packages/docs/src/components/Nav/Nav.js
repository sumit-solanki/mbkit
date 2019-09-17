import React from 'react';
import styles from './Nav.module.scss';
import { Link } from 'gatsby';
const classnames = require('classnames');

const noop = () => {};

export function SiteMapNav(props) {
    const { allPages, ...rest } = props;
    const [menuItems, setMenuItems] = React.useState([]);
    const [visibleChildren, setVisibleChildren] = React.useState([]);
    React.useEffect(() => {
        try {
            let items = [];
            const itemsSorted = allPages.allSitePage.edges.sort((a, b) => a.node.path.length - b.node.path.length);

            itemsSorted.forEach(page => {
                const { path } = page.node;
                if (path.includes('404')) {
                    return;
                }

                const depth = path.split('/');
                const sectionTitle = depth[1] === '' ? 'Home' : depth[1].replace(/-/gi, ' ');

                switch (depth.length) {
                    // Top level nav
                    case 2:
                        items.push({ to: path, title: sectionTitle });
                        break;
                    // secondary level nav
                    case 3:
                        // find parent;
                        // if doesn't exist, create it
                        // else add to child
                        const childTitle = depth[2];

                        items = items.map(item => {
                            const { title = '', menu = [] } = item;
                            if (title === sectionTitle) {
                                return {
                                    ...item,
                                    menu: [
                                        ...menu,
                                        {
                                            title: childTitle.replace(/-/g, ' '),
                                            to: path,
                                        },
                                    ],
                                };
                            }
                            return item;
                        });
                        break;
                    default:
                    // console.log(path);
                }
            });

            setMenuItems(items);
            setVisibleChildren(items.map(item => ({ title: item.title, isVisible: true })));
        } catch (e) {
            console.log(e);
        }
    }, [allPages]);

    return <Nav menu={menuItems} visibleChildren={visibleChildren} setVisibleChildren={setVisibleChildren} {...rest} />;
}

export default function Nav(props) {
    const { menu = [], className, onClick = noop, visibleChildren, setVisibleChildren, ...rest } = props;

    React.useEffect(() => {
        if (menu.length > 0 && visibleChildren.length === 0) {
            menu.map(item => ({ isVisible: true, title: item.title }));
        }
    }, [menu]);

    function handleVisibleChange(item) {
        const updatedVisibility = visibleChildren.map(c => {
            if (c.title === item.title) {
                return {
                    ...c,
                    isVisible: !c.isVisible,
                };
            }
            return c;
        });
        setVisibleChildren(updatedVisibility);
    }

    if (menu.length === 0) {
        return null;
    }

    const navClassName = classnames({
        [styles.menu]: true,
        [className]: className,
    });
    return (
        <nav className={navClassName} {...rest}>
            <ul>
                {menu
                    .sort((a, b) => a.to[0] > b.to[0])
                    .map(item => {
                        const hasChildren = item.menu && item.menu.length > 0;
                        const { isVisible } = visibleChildren.find(c => c.title === item.title) || {};
                        const buttonClassnames = classnames({
                            [styles.menu__item__toggleChildren]: true,
                            [styles.menu__item__toggleChildrenOpened]: isVisible,
                        });

                        return (
                            <li key={item.title}>
                                <div className={styles.menu__item}>
                                    {(item.to && (
                                        <Link onClick={onClick} to={item.to}>
                                            {item.title}
                                        </Link>
                                    )) ||
                                        item.title}{' '}
                                    {hasChildren && (
                                        <button
                                            onClick={() => handleVisibleChange(item)}
                                            className={buttonClassnames}
                                        />
                                    )}
                                </div>
                                {hasChildren && isVisible && (
                                    <Nav
                                        menu={item.menu}
                                        visibleChildren={visibleChildren}
                                        setVisibleChildren={setVisibleChildren}
                                        onClick={onClick}
                                    />
                                )}
                            </li>
                        );
                    })}
            </ul>
        </nav>
    );
}
