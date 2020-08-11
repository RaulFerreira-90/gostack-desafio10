import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');

      setFoods(response.data);
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const test = await api.post('/foods', { ...food, available: true });
      setFoods([...foods, test.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { image, name, description, price } = food;

    const updateFoods = foods.find(
      foodUpdate => editingFood.id === foodUpdate.id,
    );

    if (!updateFoods) {
      throw new Error('Food not find');
    }

    const updatedFood = await api.put(`/foods/${updateFoods.id}`, {
      ...updateFoods,
      name,
      image,
      description,
      price,
    });

    const updatedFoods = foods.map(oldFoods => {
      if (oldFoods.id === updatedFood.data.id) {
        return {
          ...oldFoods,
          id: updatedFood.data.id,
          name: updatedFood.data.name,
          image: updatedFood.data.image,
          description: updatedFood.data.description,
          price: updatedFood.data.price,
        };
      }
      return oldFoods;
    });

    setFoods(updatedFoods);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    const deletedFood = foods.findIndex(food => food.id === id);
    const newListFoods = [...foods];
    newListFoods.splice(deletedFood, 1);
    setFoods(newListFoods);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
