import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import './Navigation.css';
import { FaTimes, FaPlus } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { Dialog, TextInput, Pane } from 'evergreen-ui';
import Storager from '../utils/storager';

// 可拖拽的列表项
const SortableItem = SortableElement(
  ({ value, columnIndex, itemIndex, onMouseEnter, onMouseLeave, hoveredItems, onRemoveLink }) => (
    <li
      className="navigation-item"
      onMouseEnter={() => onMouseEnter(columnIndex, itemIndex)}
      onMouseLeave={() => onMouseLeave(columnIndex, itemIndex)}
    >
      <a href={value.url} target="_blank" rel="noopener noreferrer" className="navigation-link">
        {value.name}
      </a>

      <span
        className={`delete-icon ${
          hoveredItems[columnIndex] && hoveredItems[columnIndex][itemIndex] ? 'visible' : ''
        }`}
        onClick={() => onRemoveLink(columnIndex, itemIndex)}
      >
        <FaTimes />
      </span>
    </li>
  )
);

// 可拖拽的列表容器
const SortableList = SortableContainer(
  ({ items, columnIndex, onMouseEnter, onMouseLeave, hoveredItems, onRemoveLink }) => {
    return (
      <ul className="navigation-list">
        {items.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            value={value}
            columnIndex={columnIndex}
            itemIndex={index}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            hoveredItems={hoveredItems}
            onRemoveLink={onRemoveLink}
          />
        ))}
      </ul>
    );
  }
);

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditMode: false,
      hoveredItems: {}, // { columnIndex: { itemIndex: true } }
      isEditingTitle: false,
      editingColumnIndex: null,
      isDialogOpen: false,
      newLinkName: '',
      newLinkUrl: '',
      columns: [
        {
          title: '默认列',
          links: this.props.links || [],
        },
      ],
      activeColumnIndex: 0,
    };
    this.hoverTimers = {};
    this.titleInputRef = React.createRef();
    this.nameInputRef = React.createRef();
  }

  handleAddClick = () => {
    this.setState({ isDialogOpen: true });
  };

  handleAddColumn = () => {
    const newColumns = [...this.state.columns];
    newColumns.push({
      title: `新列 ${newColumns.length + 1}`,
      links: [],
    });
    this.setState({ columns: newColumns, activeColumnIndex: newColumns.length - 1 });
  };

  handleDialogClose = () => {
    this.setState({
      isDialogOpen: false,
      newLinkName: '',
      newLinkUrl: '',
    });
  };

  handleAddLink = () => {
    const { newLinkName, newLinkUrl, activeColumnIndex, columns } = this.state;
    if (!newLinkName || !newLinkUrl) return;

    const newColumns = [...columns];
    newColumns[activeColumnIndex].links = [
      ...newColumns[activeColumnIndex].links,
      { name: newLinkName, url: newLinkUrl },
    ];

    this.setState((prevState) => ({
      columns: newColumns,
      hoveredItems: {
        ...prevState.hoveredItems,
        [activeColumnIndex]: {
          ...prevState.hoveredItems[activeColumnIndex],
          [newColumns[activeColumnIndex].links.length - 1]: false,
        },
      },
    }));
    Storager.set({ navigationColumns: newColumns });
    this.props.onLinksChange && this.props.onLinksChange(newColumns);
    this.handleDialogClose();
  };

  componentDidMount() {
    Storager.get(['navigationColumns'], (result) => {
      if (result && result.navigationColumns) {
        this.setState({
          columns: result.navigationColumns,
          currentTitle:
            (result.navigationColumns[0] && result.navigationColumns[0].title) || '默认列',
        });
      } else if (this.props.links) {
        this.setState({
          columns: [
            {
              title: '默认列',
              links: this.props.links,
            },
          ],
        });
      }
    });
  }

  componentWillUnmount() {
    // 清理所有定时器
    Object.values(this.hoverTimers).forEach((timer) => clearTimeout(timer));
    this.hoverTimers = {};

    // 释放DOM引用
    this.titleInputRef.current = null;
    this.nameInputRef.current = null;
  }

  handleMouseEnter = (columnIndex, itemIndex) => {
    const timerKey = `${columnIndex}-${itemIndex}`;
    this.hoverTimers[timerKey] = setTimeout(() => {
      this.setState((prevState) => ({
        hoveredItems: {
          ...prevState.hoveredItems,
          [columnIndex]: {
            ...prevState.hoveredItems[columnIndex],
            [itemIndex]: true,
          },
        },
      }));
    }, 1000);
  };

  handleMouseLeave = (columnIndex, itemIndex) => {
    const timerKey = `${columnIndex}-${itemIndex}`;
    clearTimeout(this.hoverTimers[timerKey]);
    this.hoverTimers[timerKey] = setTimeout(() => {
      this.setState((prevState) => ({
        hoveredItems: {
          ...prevState.hoveredItems,
          [columnIndex]: {
            ...prevState.hoveredItems[columnIndex],
            [itemIndex]: false,
          },
        },
      }));
    }, 1000);
  };

  handleRemoveLink = (columnIndex, itemIndex) => {
    const { columns } = this.state;
    const newColumns = [...columns];
    newColumns[columnIndex].links.splice(itemIndex, 1);

    // 如果删除后当前列的links为空，则删除整个列
    if (newColumns[columnIndex].links.length === 0) {
      newColumns.splice(columnIndex, 1);
      // 如果删除了当前激活的列，将activeColumnIndex设置为0
      const newActiveColumnIndex =
        columnIndex === this.state.activeColumnIndex ? 0 : this.state.activeColumnIndex;
      this.setState({
        columns: newColumns,
        activeColumnIndex: newActiveColumnIndex,
      });
    } else {
      this.setState({ columns: newColumns });
    }

    Storager.set({ navigationColumns: newColumns });
    this.props.onLinksChange && this.props.onLinksChange(newColumns);
  };

  handleTitleDoubleClick = (index) => {
    this.setState(
      {
        isEditingTitle: true,
        editingColumnIndex: index,
      },
      () => {
        this.titleInputRef.current.focus();
      }
    );
  };

  handleTitleChange = (e) => {
    const { columns, editingColumnIndex } = this.state;
    const newColumns = [...columns];
    newColumns[editingColumnIndex].title = e.target.value;
    this.setState({ columns: newColumns });
  };

  handleTitleBlur = () => {
    const { columns } = this.state;
    this.setState({
      isEditingTitle: false,
      editingColumnIndex: null,
    });
    Storager.set({ navigationColumns: columns });
  };

  handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.handleTitleBlur();
    }
  };

  onSortEnd = ({ oldIndex, newIndex }, { columnIndex }) => {
    const { columns } = this.state;
    const newColumns = [...columns];

    // 重新排序当前列的links
    newColumns[columnIndex].links = arrayMove(columns[columnIndex].links, oldIndex, newIndex);

    this.setState({ columns: newColumns });
    Storager.set({ navigationColumns: newColumns });
    this.props.onLinksChange && this.props.onLinksChange(newColumns);
  };

  render() {
    const { isDarkMode } = this.props;
    const { columns, activeColumnIndex } = this.state;

    return (
      <>
        <div className={`navigation ${isDarkMode ? 'dark' : ''}`}>
          <div className="columns-container">
            {columns.map((column, index) => (
              <div
                key={index}
                className={`link-row ${index === activeColumnIndex ? 'active' : ''}`}
                onClick={() => this.setState({ activeColumnIndex: index })}
              >
                <div className="header">
                  <div
                    className="header-title"
                    onDoubleClick={() => this.handleTitleDoubleClick(index)}
                  >
                    {this.state.isEditingTitle && this.state.editingColumnIndex === index ? (
                      <input
                        type="text"
                        ref={this.titleInputRef}
                        className="title-input"
                        value={columns[index].title}
                        onChange={this.handleTitleChange}
                        onBlur={this.handleTitleBlur}
                        onKeyDown={this.handleTitleKeyDown}
                      />
                    ) : (
                      columns[index].title
                    )}
                  </div>
                  <div className="operation">
                    <FaPlus
                      className="add-link-row-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleAddColumn();
                      }}
                    />
                  </div>
                </div>
                <SortableList
                  items={column.links}
                  onSortEnd={(sortInfo) => this.onSortEnd(sortInfo, { columnIndex: index })}
                  columnIndex={index}
                  lockAxis="y"
                  distance={5}
                  onMouseEnter={this.handleMouseEnter}
                  onMouseLeave={this.handleMouseLeave}
                  hoveredItems={this.state.hoveredItems}
                  onRemoveLink={this.handleRemoveLink}
                />
                <div className="add-item" onClick={this.handleAddClick}>
                  <FaPlus />
                </div>
              </div>
            ))}
          </div>

          <Dialog
            isShown={this.state.isDialogOpen}
            title="添加导航链接"
            onCloseComplete={this.handleDialogClose}
            confirmLabel="添加"
            cancelLabel="取消"
            onConfirm={this.handleAddLink}
            width={400}
          >
            <Pane display="flex" flexDirection="column" gap={4} padding={8}>
              <TextInput
                name="name"
                value={this.state.newLinkName}
                onChange={(e) => this.setState({ newLinkName: e.target.value })}
                placeholder="网站名称"
                width="100%"
                height={32}
                autoFocus
              />
              <TextInput
                name="url"
                value={this.state.newLinkUrl}
                onChange={(e) => this.setState({ newLinkUrl: e.target.value })}
                placeholder="网站地址"
                type="url"
                width="100%"
                height={32}
              />
            </Pane>
          </Dialog>
        </div>
      </>
    );
  }
}

Navigation.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  setLinks: PropTypes.func,
  onLinksChange: PropTypes.func,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};

export default Navigation;
