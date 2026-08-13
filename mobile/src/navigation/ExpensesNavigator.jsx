import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExpenseClaimsScreen from '../screens/expenses/ExpenseClaimsScreen';
import ExpenseCategoriesScreen from '../screens/expenses/ExpenseCategoriesScreen';
import ExpenseApprovalScreen from '../screens/expenses/ExpenseApprovalScreen';
import ReimbursementsScreen from '../screens/expenses/ReimbursementsScreen';
import ExpenseReportsScreen from '../screens/expenses/ExpenseReportsScreen';

const Stack = createNativeStackNavigator();

export default function ExpensesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExpenseClaims" component={ExpenseClaimsScreen} />
      <Stack.Screen name="ExpenseCategories" component={ExpenseCategoriesScreen} />
      <Stack.Screen name="ExpenseApproval" component={ExpenseApprovalScreen} />
      <Stack.Screen name="Reimbursements" component={ReimbursementsScreen} />
      <Stack.Screen name="ExpenseReports" component={ExpenseReportsScreen} />
    </Stack.Navigator>
  );
}
