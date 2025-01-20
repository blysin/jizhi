import React, { Component } from 'react';
import Storager from '../utils/storager';
import './Navigation.css';
import { FaPlus,  FaTimes  } from 'react-icons/fa';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      url: '',
      links: [],
      showContextMenu: null,
      showAddForm: false,
      contextMenuPosition: { x: 0, y: 0 },
      showEditMode: false,
      hoveredItem: null,
    };
    this.nameInputRef = React.createRef();
    this.hoverTimers = {};
  }

  componentWillUnmount() {
    // 清除所有定时器
    Object.values(this.hoverTimers).forEach(timer => clearTimeout(timer));
  }

  handleMouseEnter = (index) => {
    this.hoverTimers[index] = setTimeout(() => {
      this.setState({ hoveredItem: index });
    }, 1000);
  };

  handleMouseLeave = (index) => {
    clearTimeout(this.hoverTimers[index]);
    this.hoverTimers[index] = setTimeout(() => {
      this.setState({ hoveredItem: null });
    }, 1000);
  };

  componentDidMount() {
    Storager.get(['links'], (res) => {
      this.setState({ links: res.links || [] });
    });
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddLink = (e) => {
    e.preventDefault();
    const { name, url, links } = this.state;
    if (!name || !url) return;

    const newLinks = [...links, { name, url }];
    this.setState(
      {
        links: newLinks,
        name: '',
        url: '',
        showAddForm: false,
        hoveredItem: null,
      },
      () => {
        Storager.set({ links: newLinks });
      }
    );
  };

  handleRemoveLink = (index) => {
    const newLinks = [...this.state.links];
    newLinks.splice(index, 1);
    this.setState({ links: newLinks, showContextMenu: null }, () => {
      Storager.set({ links: newLinks });
    });
  };

  handleContextMenu = (e, index) => {
    e.preventDefault();
    this.setState({
      showContextMenu: index,
      contextMenuPosition: { x: e.clientX, y: e.clientY },
    });
  };

  toggleAddForm = () => {
    this.setState(
      (prevState) => ({ showAddForm: !prevState.showAddForm }),
      () => {
        if (this.state.showAddForm && this.nameInputRef.current) {
          this.nameInputRef.current.focus();
        }
      }
    );
  };

  render() {
    const { name, url, links, showContextMenu, showAddForm, contextMenuPosition } = this.state;
    const { isDarkMode } = this.props;

    return (
      <>
        <div className={`navigation ${isDarkMode ? 'dark' : ''}`}>
          <ul className="navigation-list">
            {links.map((link, index) => (
              <li
                key={index}
                className="navigation-item"
                onMouseEnter={() => this.handleMouseEnter(index)}
                onMouseLeave={() => this.handleMouseLeave(index)}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigation-link"
                >
                  {link.name}
                </a>

                <span
                  className={`delete-icon ${this.state.hoveredItem === index ? 'visible' : ''}`}
                  onClick={() => this.handleRemoveLink(index)}
                >
                  <FaTimes  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {showContextMenu !== null && (
          <div
            className="context-menu"
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          ></div>
        )}

        <div className="add-button" onClick={this.toggleAddForm}>
          <FaPlus />
        </div>

        {showAddForm && (
          <div className={`add-form ${isDarkMode ? 'dark' : ''}`}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={this.handleInputChange}
              placeholder="网站名称"
              className="add-input"
              ref={this.nameInputRef}
            />
            <input
              type="url"
              name="url"
              value={url}
              onChange={this.handleInputChange}
              placeholder="网站地址"
              className="add-input"
            />
            <button type="button" className="navigation-button" onClick={this.handleAddLink}>
              添加
            </button>
          </div>
        )}
      </>
    );
  }
}

export default Navigation;
