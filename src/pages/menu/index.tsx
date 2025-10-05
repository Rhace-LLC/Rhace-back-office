import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Edit, DollarSign, UtensilsCrossed } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockCategories = [
  {
    id: 1,
    name: 'Appetizers',
    dishes: [
      { id: 1, name: 'Bruschetta', price: 12.50, description: 'Toasted bread with tomatoes and basil', available: true, addons: ['Extra Cheese', 'Garlic'] },
      { id: 2, name: 'Caesar Salad', price: 14.00, description: 'Romaine lettuce with parmesan and croutons', available: true, addons: ['Chicken', 'Shrimp'] },
      { id: 3, name: 'Calamari Rings', price: 16.50, description: 'Crispy fried squid with marinara sauce', available: false, addons: ['Spicy Sauce'] }
    ]
  },
  {
    id: 2,
    name: 'Main Courses',
    dishes: [
      { id: 4, name: 'Margherita Pizza', price: 18.50, description: 'Classic pizza with tomato, mozzarella, and basil', available: true, addons: ['Extra Cheese', 'Pepperoni', 'Mushrooms'] },
      { id: 5, name: 'Spaghetti Carbonara', price: 19.50, description: 'Pasta with eggs, cheese, and pancetta', available: true, addons: ['Extra Parmesan', 'Black Pepper'] },
      { id: 6, name: 'Ribeye Steak', price: 35.00, description: '12oz premium cut with seasonal vegetables', available: true, addons: ['Medium Rare', 'Well Done', 'Garlic Butter'] },
      { id: 7, name: 'Fish & Chips', price: 22.00, description: 'Beer-battered cod with crispy fries', available: true, addons: ['Mushy Peas', 'Tartar Sauce'] }
    ]
  },
  {
    id: 3,
    name: 'Desserts',
    dishes: [
      { id: 8, name: 'Tiramisu', price: 8.50, description: 'Classic Italian dessert with coffee and mascarpone', available: true, addons: [] },
      { id: 9, name: 'Chocolate Lava Cake', price: 9.00, description: 'Warm chocolate cake with molten center', available: true, addons: ['Vanilla Ice Cream'] },
      { id: 10, name: 'Cheesecake', price: 7.50, description: 'New York style with berry compote', available: false, addons: ['Extra Berries'] }
    ]
  },
  {
    id: 4,
    name: 'Beverages',
    dishes: [
      { id: 11, name: 'House Wine', price: 12.00, description: 'Red or white wine selection', available: true, addons: [] },
      { id: 12, name: 'Craft Beer', price: 6.50, description: 'Local brewery selection', available: true, addons: [] },
      { id: 13, name: 'Fresh Juices', price: 4.50, description: 'Orange, apple, or cranberry', available: true, addons: [] },
      { id: 14, name: 'Coffee', price: 3.50, description: 'Freshly brewed coffee', available: true, addons: ['Extra Shot', 'Decaf'] }
    ]
  }
];

export function MenuManagement() {
  const [categories, setCategories] = useState(mockCategories);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1, 2]);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  console.log({selectedDish})
  const [isEditMode, setIsEditMode] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    price: '',
    description: '',
    available: true,
    addons: ''
  });

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const openDishForm = (dish?: any) => {
    if (dish) {
      setSelectedDish(dish);
      setDishForm({
        name: dish.name,
        price: dish.price.toString(),
        description: dish.description,
        available: dish.available,
        addons: dish.addons.join(', ')
      });
      setIsEditMode(true);
    } else {
      setSelectedDish(null);
      setDishForm({
        name: '',
        price: '',
        description: '',
        available: true,
        addons: ''
      });
      setIsEditMode(false);
    }
  };

  const saveDish = () => {
    // In a real app, this would save to the backend
    console.log('Saving dish:', dishForm);
    // Reset form
    setDishForm({
      name: '',
      price: '',
      description: '',
      available: true,
      addons: ''
    });
  };

  const toggleDishAvailability = (categoryId: number, dishId: number) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            dishes: category.dishes.map(dish => 
              dish.id === dishId 
                ? { ...dish, available: !dish.available }
                : dish
            )
          }
        : category
    ));
  };

  const totalDishes = categories.reduce((sum, category) => sum + category.dishes.length, 0);
  const availableDishes = categories.reduce((sum, category) => 
    sum + category.dishes.filter(dish => dish.available).length, 0
  );
  const averagePrice = categories.reduce((sum, category) => 
    sum + category.dishes.reduce((catSum, dish) => catSum + dish.price, 0), 0
  ) / totalDishes;

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Menu Management</h1>
          <p className="text-muted-foreground">Manage dishes, categories, and availability</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button onClick={() => openDishForm()} className="bg-[#2542e3]">
              <Plus className="w-4 h-4 mr-1" />
              Add Dish
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isEditMode ? 'Edit Dish' : 'Add New Dish'}</SheetTitle>
              <SheetDescription>
                {isEditMode ? 'Update dish information' : 'Create a new dish for the menu'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Dish Name</Label>
                <Input
                  id="name"
                  value={dishForm.name}
                  onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={dishForm.price}
                  onChange={(e) => setDishForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={dishForm.description}
                  onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the dish..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="addons">Add-ons (comma separated)</Label>
                <Input
                  id="addons"
                  value={dishForm.addons}
                  onChange={(e) => setDishForm(prev => ({ ...prev, addons: e.target.value }))}
                  placeholder="Extra Cheese, Spicy Sauce, etc."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={dishForm.available}
                  onCheckedChange={(checked: any) => setDishForm(prev => ({ ...prev, available: checked }))}
                />
                <Label htmlFor="available">Available for ordering</Label>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={saveDish} className="flex-1 bg-[#2542e3]">
                  {isEditMode ? 'Update Dish' : 'Add Dish'}
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Dishes</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalDishes}</div>
            <p className="text-xs text-muted-foreground">Across {categories.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available</CardTitle>
            <Badge variant="default" className="text-xs">
              {availableDishes}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{availableDishes}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Unavailable</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalDishes - availableDishes}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalDishes - availableDishes}</div>
            <p className="text-xs text-muted-foreground">Out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per dish</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Categories</CardTitle>
          <CardDescription>
            Expand categories to view and manage dishes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.dishes.length} dishes
                  </Badge>
                </div>
                <Badge className="text-xs">
                  {category.dishes.filter(dish => dish.available).length} available
                </Badge>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dish Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Add-ons</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.dishes.map((dish) => (
                      <TableRow key={dish.id}>
                        <TableCell>
                          <div>
                            <div>{dish.name}</div>
                            <div className="text-xs text-muted-foreground">{dish.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>${dish.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={dish.available}
                              onCheckedChange={() => toggleDishAvailability(category.id, dish.id)}
                              
                            />
                            <Badge variant={dish.available ? 'default' : 'secondary'} className="text-xs">
                              {dish.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {dish.addons.length > 0 ? dish.addons.join(', ') : 'None'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openDishForm(dish)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Edit Dish</SheetTitle>
                                <SheetDescription>
                                  Update dish information
                                </SheetDescription>
                              </SheetHeader>
                              
                              <div className="mt-6 space-y-4">
                                <div>
                                  <Label htmlFor="name">Dish Name</Label>
                                  <Input
                                    id="name"
                                    value={dishForm.name}
                                    onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter dish name"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="price">Price ($)</Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={dishForm.price}
                                    onChange={(e) => setDishForm(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="0.00"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="description">Description</Label>
                                  <Textarea
                                    id="description"
                                    value={dishForm.description}
                                    onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe the dish..."
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="addons">Add-ons (comma separated)</Label>
                                  <Input
                                    id="addons"
                                    value={dishForm.addons}
                                    onChange={(e) => setDishForm(prev => ({ ...prev, addons: e.target.value }))}
                                    placeholder="Extra Cheese, Spicy Sauce, etc."
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="available"
                                    checked={dishForm.available}
                                    onCheckedChange={(checked: any) => setDishForm(prev => ({ ...prev, available: checked }))}
                                  />
                                  <Label htmlFor="available">Available for ordering</Label>
                                </div>

                                <Separator />

                                <div className="flex gap-2">
                                  <Button onClick={saveDish} className="flex-1 bg-[#2542e3]">
                                    Update Dish
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}