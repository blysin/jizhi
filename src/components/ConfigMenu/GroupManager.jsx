import React, { useState, useEffect } from 'react';
import {
  Pane,
  Table,
  TextInputField,
  IconButton,
  AddIcon,
  EditIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TickIcon,
  CrossIcon,
} from 'evergreen-ui';
import Storager from '../../utils/storager';

const GroupManager = () => {
  const [columns, setColumns] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    Storager.get(['navigationColumns'], (result) => {
      if (result.navigationColumns) {
        setColumns(result.navigationColumns);
      }
    });
  }, []);

  const saveColumns = (newColumns) => {
    setColumns(newColumns);
    Storager.set({ navigationColumns: newColumns });
  };

  const handleAddNewGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = { title: newGroupName.trim(), links: [] };
    saveColumns([...columns, newGroup]);
    setNewGroupName('');
  };

  const handleStartEdit = (index, title) => {
    setEditingIndex(index);
    setEditingTitle(title);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingTitle('');
  };

  const handleSaveEdit = (index) => {
    if (!editingTitle.trim()) return;
    const newColumns = [...columns];
    newColumns[index].title = editingTitle.trim();
    saveColumns(newColumns);
    setEditingIndex(null);
    setEditingTitle('');
  };

  const handleDelete = (index) => {
    if (
      window.confirm(
        `确定要删除分组 "${columns[index].title}" 吗？此操作将删除该分组下的所有链接。`
      )
    ) {
      const newColumns = columns.filter((_, i) => i !== index);
      saveColumns(newColumns);
    }
  };

  const handleMove = (index, direction) => {
    const newColumns = [...columns];
    const item = newColumns.splice(index, 1)[0];
    newColumns.splice(index + direction, 0, item);
    saveColumns(newColumns);
  };

  return (
    <Pane padding={16}>
      <Pane display="flex" marginBottom={16}>
        <TextInputField
          label="新分组名称"
          placeholder="输入后点击添加"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          flex={1}
          marginRight={8}
          hint=""
        />
        <IconButton icon={AddIcon} onClick={handleAddNewGroup} alignSelf="flex-end" height={32} />
      </Pane>

      <Table>
        <Table.Head>
          <Table.TextHeaderCell>分组名称</Table.TextHeaderCell>
          <Table.TextHeaderCell width={160} flex="none">
            操作
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {columns.map((col, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                {editingIndex === index ? (
                  <TextInputField
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                    label=""
                    hint=""
                  />
                ) : (
                  col.title
                )}
              </Table.Cell>
              <Table.Cell width={160} flex="none">
                {editingIndex === index ? (
                  <>
                    <IconButton
                      icon={TickIcon}
                      intent="success"
                      onClick={() => handleSaveEdit(index)}
                      marginRight={8}
                    />
                    <IconButton icon={CrossIcon} intent="danger" onClick={handleCancelEdit} />
                  </>
                ) : (
                  <>
                    <IconButton
                      icon={EditIcon}
                      onClick={() => handleStartEdit(index, col.title)}
                      marginRight={8}
                    />
                    <IconButton
                      icon={TrashIcon}
                      intent="danger"
                      onClick={() => handleDelete(index)}
                      marginRight={8}
                    />
                    <IconButton
                      icon={ArrowUpIcon}
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      marginRight={8}
                    />
                    <IconButton
                      icon={ArrowDownIcon}
                      onClick={() => handleMove(index, 1)}
                      disabled={index === columns.length - 1}
                    />
                  </>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Pane>
  );
};

export default GroupManager;
